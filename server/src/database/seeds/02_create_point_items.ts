import { Knex } from "knex";

export async function seed(knex: Knex) {
  // limpa vínculos
  await knex("point_items").del();

  // mapeia: ponto 1 (Fortaleza) coleta Eletrônicos (4) e Óleo (6)
  //         ponto 2 (Natal)     coleta Lâmpadas (1) e Eletrônicos (4)
  await knex("point_items").insert([
    { point_id: 1, item_id: 4 },
    { point_id: 1, item_id: 6 },
    { point_id: 2, item_id: 1 },
    { point_id: 2, item_id: 4 },
  ]);
}
