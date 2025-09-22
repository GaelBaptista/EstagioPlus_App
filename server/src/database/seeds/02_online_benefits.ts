import { Knex } from "knex";

export async function seed(knex: Knex) {
  await knex("online_benefits").del();

  await knex("online_benefits").insert([
    // Educação (1) — nacional
    {
      id: 1,
      title: "Acesso Gratuito a minicursos IGT",
      partner_name: "IGT Cursos",
      category_id: 1,
      details: "Minicursos online gratuitos para estagiários Estágio Plus.",
      discount_label: "Grátis",
      logo: "educacao.svg",
      website: "https://exemplo.com/igt",
      phone: "+5585999990000",
      availability_scope: "NATIONAL",
      states: null,
      cities: null,
      company_ids: null,
    },
    // Saúde (2) — CE e RN
    {
      id: 2,
      title: "Consultas online com Psicólogos (Eliene Duarte)",
      partner_name: "Eliene Duarte",
      category_id: 2,
      details: "Atendimento online com valor especial via WhatsApp.",
      discount_label: "Desconto",
      logo: "saude.svg",
      website: "https://exemplo.com/psicologia",
      phone: "+5585987654321",
      availability_scope: "STATE",
      states: "CE,RN",
      cities: null,
      company_ids: null,
    },
    // Cultura e Lazer (3) — cidade (Fortaleza/Natal); (continua valendo)
    {
      id: 3,
      title: "Sorteio trimestral de ingressos",
      partner_name: "Cultura+",
      category_id: 3,
      details: "Sorteios de ingressos para cinema/eventos para sua região.",
      discount_label: "Sorteio",
      logo: "cultura.svg",
      website: "https://exemplo.com/sorteio",
      phone: "+5585991112222",
      availability_scope: "CITY",
      states: null,
      cities: "Fortaleza:CE,Natal:RN",
      company_ids: null,
    },
    // Economia (4) — nacional (para bater no filtro “Consumo e Economia”)
    {
      id: 4,
      title: "Desconto na JM Sport Online",
      partner_name: "JM Sport",
      category_id: 4,
      details: "Desconto em compras online.",
      discount_label: "-10%",
      logo: "economia.svg",
      website: "https://exemplo.com/jmsport",
      phone: "+5585993334444",
      availability_scope: "NATIONAL",
      states: null,
      cities: null,
      company_ids: null,
    },
  ]);
}
