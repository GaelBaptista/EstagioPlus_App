import { Request, Response } from "express";
import knex from "../database/connection";
import bcrypt from "bcryptjs";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

function makeToken(userId: number) {
  const secret: Secret = process.env.JWT_SECRET || "dev-secret";
  const expiresIn: SignOptions["expiresIn"] =
    (process.env.JWT_EXPIRES as any) || "7d";
  return jwt.sign({}, secret, { subject: String(userId), expiresIn });
}

function serializeUser(row: any) {
  return {
    id: row.id,
    name: row.name,
    cpf: row.cpf,
    email: row.email,
    points: row.points,
    nextLevel: row.next_level,
    level: row.level,
    avatar_url: row.avatar_url || undefined,
  };
}

export default class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body || {};
      console.log("[/auth/login] body:", req.body); // 👈

      if (!email || !password) {
        return res.status(400).json({ message: "Informe e-mail e senha." });
      }

      const user = await knex("users").where({ email }).first();
      console.log("[/auth/login] user:", user?.id, user?.email); // 👈

      if (!user || !user.password_hash) {
        return res.status(401).json({ message: "Credenciais inválidas." });
      }

      const ok = await bcrypt.compare(password, user.password_hash);
      console.log("[/auth/login] bcrypt compare:", ok); // 👈

      if (!ok) {
        return res.status(401).json({ message: "Credenciais inválidas." });
      }

      const token = makeToken(user.id);
      return res.json({ token, user: serializeUser(user) });
    } catch (e) {
      console.error("[/auth/login] error:", e);
      return res.status(500).json({ message: "Erro interno" });
    }
  }

  async me(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Não autorizado" });
    const user = await knex("users").where("id", userId).first();
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
    return res.json({ user: serializeUser(user) });
  }
}
