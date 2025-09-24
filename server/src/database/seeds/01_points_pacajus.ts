import { Knex } from "knex";

export async function seed(knex: Knex) {
  await knex("point_items").del();
  await knex("points").del();

  const [p1] = await knex("points").insert({
    image: "https://images.unsplash.com/photo-1501523460185-2aa5d2a0f981?w=400",
    name: "Faculdade Uniateneu",
    email: "contato@uniateneu.br",
    whatsapp: "+5585999990000",
    latitude: -4.1713,
    longitude: -38.4636,
    city: "Pacajus",
    uf: "CE",
  }, ["id"]);

  const [p2] = await knex("points").insert({
    image: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?w=400",
    name: "Cartão de Todos",
    email: "contato@cartaodetodos.com",
    whatsapp: "+5585988880000",
    latitude: -4.1718,
    longitude: -38.4610,
    city: "Pacajus",
    uf: "CE",
  }, ["id"]);

  // relacione com categorias (items)
  // ex.: 1 = Educação, 2 = Saúde, 3 = Cultura, 4 = Economia, 5 = Outros
  await knex("point_items").insert([
    { point_id: p1.id, item_id: 1 },
    { point_id: p2.id, item_id: 4 },
  ]);
}
