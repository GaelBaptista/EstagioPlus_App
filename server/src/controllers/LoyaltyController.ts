import { Request, Response } from "express";
import knex from "../database/connection";
import dayjs from "dayjs";

const META_PONTOS = 1_000_000;

function diffDays(a: string, b: string) {
  const d1 = dayjs(a).startOf("day");
  const d2 = dayjs(b).startOf("day");
  return Math.max(0, d2.diff(d1, "day"));
}

/** Credita pontos diários faltantes (idempotente por dia) */
export async function accrueToday(req: Request, res: Response) {
  const userId = (req as any).userId;
  const user = await knex("users").where("id", userId).first();
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  const today = dayjs().format("YYYY-MM-DD");

  // se não tem start_date, define hoje como início
  const start = user.contract_start_date ?? today;

  const last = user.last_accrual_date ?? start;
  const diasPendentes = diffDays(last, today);

  if (diasPendentes > 0) {
    const add = diasPendentes * Number(user.daily_points_rate ?? 2800);
    await knex("users")
      .where("id", userId)
      .update({
        points_base: Number(user.points_base ?? 0) + add,
        last_accrual_date: today,
        contract_start_date: start,
        updated_at: knex.fn.now(),
      });
  }

  return res.json({ ok: true, credited_days: diasPendentes });
}

/** Resumo do progresso + marcos + bônus possíveis */
export async function getProgress(req: Request, res: Response) {
  const userId = (req as any).userId;
  const user = await knex("users").where("id", userId).first();
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  const points = Number(user.points_base ?? 0); // base + (no futuro: variáveis)
  const percent = Math.min(1, points / META_PONTOS);

  // marcos de 3 em 3 meses (rótulos)
  const milestones = [0.25, 0.5, 0.75, 1].map((p) => ({
    pct: p,
    label: p === 1 ? "12 meses concluídos" : `${Math.round(p * 12)} meses`,
    reached: percent >= p,
  }));

  // bônus do mês disponível?
  const monthCode = `MONTH-${dayjs().format("YYYY-MM")}`;
  const alreadyMonth = await knex("user_bonuses").where({ user_id: userId, code: monthCode }).first();

  return res.json({
    meta: META_PONTOS,
    points,
    percent,
    daily_rate: Number(user.daily_points_rate ?? 2800),
    milestones,
    month_bonus_available: !alreadyMonth,
  });
}

/** Resgata bônus do mês (uma vez por mês) */
export async function claimMonthly(req: Request, res: Response) {
  const userId = (req as any).userId;
  const code = `MONTH-${dayjs().format("YYYY-MM")}`;
  const exists = await knex("user_bonuses").where({ user_id: userId, code }).first();
  if (exists) return res.status(400).json({ message: "Bônus do mês já resgatado" });

  const BONUS = 10_000;
  await knex("user_bonuses").insert({ user_id: userId, code, points: BONUS });

  // soma no base
  await knex("users")
    .where("id", userId)
    .update({ points_base: knex.raw("points_base + ?", [BONUS]) });

  return res.json({ ok: true, code, points: BONUS });
}
