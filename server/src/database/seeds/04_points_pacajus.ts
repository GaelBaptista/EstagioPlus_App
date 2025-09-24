import { Knex } from "knex";

export async function seed(knex: Knex) {
  // Apaga vínculos e points para re-seedar
  await knex("point_items").del();
  await knex("points").del();

  // JM Sport (ponto físico) — Pacajus/CE
  const [pointId] = await knex("points").insert([
    {
      image: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=1200&auto=format&fit=crop",
      name: "JM Sport - Pacajus",
      email: "contato@jmsport.com",
      whatsapp: "+5585999990000",
      latitude: -4.1699,
      longitude: -38.4633,
      city: "Pacajus",
      uf: "CE",
    },
  ]);

  // Vincula à categoria 4 (Consumo e Economia) — ajuste se seu ID for diferente
  await knex("point_items").insert([{ point_id: pointId, item_id: 4 }]);
}
