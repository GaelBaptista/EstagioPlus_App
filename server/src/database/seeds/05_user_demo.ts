// src/database/seeds/30_user_demo2.ts
import { Knex } from "knex";
import bcrypt from "bcryptjs";

export async function seed(knex: Knex) {
  const password_hash = bcrypt.hashSync("123456", 8);

  // upsert simples por email
  const existingGab = await knex("users").where({ email: "gabriel@estagioplus.com" }).first();
  if (!existingGab) {
    await knex("users").insert({
      name: "Gabriel Sousa",
      email: "gabriel@estagioplus.com",
      cpf: "07212345678",
      password_hash,
      points: 0,
      next_level: 1_000_000,
      level: "Bronze",
      points_base: 0,
      daily_points_rate: 2800,
      contract_start_date: null,
      last_accrual_date: null,
    });
  }

  const existingTeste = await knex("users").where({ email: "teste@estagioplus.com" }).first();
  if (!existingTeste) {
    await knex("users").insert({
      name: "Usuário Demo",
      email: "teste@estagioplus.com",
      cpf: "12345678909",
      password_hash,
      points: 0,
      next_level: 1_000_000,
      level: "Bronze",
      points_base: 0,
      daily_points_rate: 2800,
      contract_start_date: null,
      last_accrual_date: null,
    });
  }
}
