import { Knex } from "knex";
import bcrypt from "bcryptjs";

export async function seed(knex: Knex) {
  const email = "teste@estagioplus.com";
  const exists = await knex("users").where({ email }).first();
  if (exists) return;

  const passwordHash = await bcrypt.hash("123456", 10);

  await knex("users").insert({
    email,
    password: passwordHash,
    name: "Usuário Demo",
  });
}
