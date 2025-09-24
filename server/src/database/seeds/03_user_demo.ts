import { Knex } from "knex";
import bcrypt from "bcryptjs";

export async function seed(knex: Knex) {
  await knex("users").del();
  const password_hash = bcrypt.hashSync("123456", 8);
  await knex("users").insert([
    {
      name: "Gabriel Sousa",
      email: "gabriel@estagioplus.com",
      cpf: "07212345678",
      password_hash,
      points: 3280,
      next_level: 5000,
      level: "Ouro",
      avatar_url: null,
    },
  ]);
}
