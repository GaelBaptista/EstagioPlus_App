import { Knex } from "knex";

export async function seed(knex: Knex) {
  await knex("point_items").del();
  await knex("points").del();

  // Coordenadas aproximadas no centro de Pacajus/CE
  const PAC_LAT = -4.1708;
  const PAC_LNG = -38.4630;

  const points = [
    {
      id: 1,
      image: "economia.svg", // pode ser nome de arquivo do /uploads
      name: "JM Sport Pacajus",
      email: "contato@jmsport.example",
      whatsapp: "+5585991112222",
      latitude: PAC_LAT + 0.003,
      longitude: PAC_LNG - 0.002,
      city: "Pacajus",
      uf: "CE",
    },
    {
      id: 2,
      image: "educacao.svg",
      name: "IGT Cursos Polo Pacajus",
      email: "contato@igt.example",
      whatsapp: "+5585992223333",
      latitude: PAC_LAT - 0.002,
      longitude: PAC_LNG + 0.002,
      city: "Pacajus",
      uf: "CE",
    },
    {
      id: 3,
      image: "saude.svg",
      name: "Clínica Saúde+ Pacajus",
      email: "contato@saudemais.example",
      whatsapp: "+5585994445555",
      latitude: PAC_LAT + 0.001,
      longitude: PAC_LNG + 0.0015,
      city: "Pacajus",
      uf: "CE",
    },
  ];

  await knex("points").insert(points);

  // ligações ponto-categoria (point_items)
  // JM Sport -> Consumo e Economia (4)
  // IGT Cursos -> Educação (1)
  // Clínica -> Saúde (2)
  const pointItems = [
    { point_id: 1, item_id: 4 },
    { point_id: 2, item_id: 1 },
    { point_id: 3, item_id: 2 },
  ];

  await knex("point_items").insert(pointItems);
}
