import { Knex } from "knex";

export async function seed(knex: Knex) {
  // limpa
  await knex("point_items").del();
  await knex("points").del();

  await knex("points").insert([
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1528323273322-d81458248d40?w=800&q=60",
      name: "Eco Ponto Centro",
      email: "centro@ecoleta.com",
      whatsapp: "+5585999990000",
      latitude: -3.71722,
      longitude: -38.54337,
      city: "Fortaleza",
      uf: "CE",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=800&q=60",
      name: "Eco Ponto Natal Shopping",
      email: "natal@ecoleta.com",
      whatsapp: "+5584988887777",
      latitude: -5.814,
      longitude: -35.208,
      city: "Natal",
      uf: "RN",
    },
  ]);
}
