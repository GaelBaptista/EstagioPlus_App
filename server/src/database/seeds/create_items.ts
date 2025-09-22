import { Knex } from "knex";

export async function seed(knex: Knex) {
    await knex("items").del();
  await knex("items").insert([
    { title: "Educação e Desenvolvimento", image: "educacao.svg" },
    { title: "Saúde e Bem Estar", image: "saude.svg" },
    { title: "Cultura e Lazer", image: "cultura.svg" },
    { title: "Consumo e Economia", image: "economia.svg" },
    { title: "outros", image: "outros.svg" },
    
  ]);
}
