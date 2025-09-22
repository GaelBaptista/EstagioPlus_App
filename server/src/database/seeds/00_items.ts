import { Knex } from "knex";

export async function seed(knex: Knex) {
  await knex("point_items").del();
  await knex("points").del();
  await knex("items").del();

  await knex("items").insert([
    { id: 1, title: "Educação e Desenvolvimento", image: "educacao.svg" },
    { id: 2, title: "Saúde e Bem Estar",         image: "saude.svg" },
    { id: 3, title: "Cultura e Lazer",           image: "cultura.svg" },
    { id: 4, title: "Consumo e Economia",        image: "economia.svg" },
    { id: 5, title: "Outros",                    image: "outros.svg" },
  ]);
}
