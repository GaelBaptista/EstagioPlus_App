import { Knex } from "knex";

export async function seed(knex: Knex) {
  // limpa tudo na ordem certa
  await knex("point_items").del();
  await knex("points").del();
  await knex("online_benefits").del();

  /* =========================
   *  FÍSICOS — JM Sport
   *  Categoria: 4 (Consumo e Economia)
   * ========================= */
  // Pacajus (CE) — pedido para testes
  const [pacajusId] = await knex("points").insert([{
    image: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=1200&auto=format&fit=crop",
    name: "JM Sport - Pacajus",
    email: "pacajus@jmsport.com",
    whatsapp: "+55 85 99999-0000",
    latitude: -4.1708,
    longitude: -38.4630,
    city: "Pacajus",
    uf: "CE",
  }]);

  // Natal (RN) — para ver CE e RN funcionando
  const [natalId] = await knex("points").insert([{
    image: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=1200&auto=format&fit=crop",
    name: "JM Sport - Natal",
    email: "natal@jmsport.com",
    whatsapp: "+55 84 98888-0001",
    latitude: -5.7945,
    longitude: -35.2110,
    city: "Natal",
    uf: "RN",
  }]);

  // vincula ambos à categoria Consumo e Economia (id 4)
  await knex("point_items").insert([
    { point_id: pacajusId, item_id: 4 },
    { point_id: natalId,   item_id: 4 },
  ]);

  /* =========================
   *  ONLINE — exatamente os que você listou
   * ========================= */

  // Educação e Desenvolvimento
  await knex("online_benefits").insert([
    {
      id: 1,
      title: "Acesso gratuito a minicursos IGT",
      partner_name: "IGT",
      category_id: 1, // Educação
      details: "Acesso gratuito a minicursos da IGT para estagiários.",
      discount_label: "Gratuito",
      logo: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=600&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop",
      phone: "+55 85 99999-1111",
      website: "https://igt.example.com",
      availability_scope: "NATIONAL", // REGIÕES → nacional
      states: null,
      cities: null,
    },
    {
      id: 2,
      title: "Desconto em graduação e pós - Faculdade Uniateneu",
      partner_name: "Faculdade Uniateneu",
      category_id: 1, // Educação
      details: "Descontos exclusivos em cursos de graduação e pós-graduação.",
      discount_label: "Bolsa parcial",
      logo: "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=600&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop",
      phone: "+55 85 98888-2222",
      website: "https://uniateneu.example.com",
      availability_scope: "NATIONAL", // você disse REGIÕES — tratamos como nacional por enquanto
      states: null,
      cities: null,
    },
    {
      id: 3,
      title: "Desconto em cursos técnicos - Grau Técnico RN",
      partner_name: "Grau Técnico RN",
      category_id: 1, // Educação
      details: "Desconto especial em cursos técnicos e profissionalizantes no RN.",
      discount_label: "Desconto RN",
      logo: "https://images.unsplash.com/photo-1541233349642-6e425fe6190e?q=80&w=600&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop",
      phone: "+55 84 97777-3333",
      website: "https://grautecnico.example.com",
      availability_scope: "STATE", // exclusivo RN
      states: "RN",
      cities: null,
    },
  ]);

  // Saúde e Bem Estar
  await knex("online_benefits").insert([
    {
      id: 4,
      title: "Plano de desconto com Cartão de Todos",
      partner_name: "Cartão de Todos",
      category_id: 2, // Saúde
      details: "Plano com descontos em saúde e bem-estar em rede credenciada.",
      discount_label: "Descontos em rede",
      logo: "https://images.unsplash.com/photo-1584516150909-c43483ee7932?q=80&w=600&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=1200&auto=format&fit=crop",
      phone: "+55 11 90000-4444",
      website: "https://cartaodetodos.example.com",
      availability_scope: "NATIONAL",
      states: null,
      cities: null,
    },
    {
      id: 5,
      title: "Consultas online com Psicólogos (Eliene Duarte)",
      partner_name: "Eliene Duarte",
      category_id: 2, // Saúde
      details: "Atendimento psicológico online com tarifas especiais.",
      discount_label: "Condição especial",
      logo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=1200&auto=format&fit=crop",
      phone: "+55 85 95555-1212",
      website: "https://psico.example.com",
      availability_scope: "NATIONAL",
      states: null,
      cities: null,
    },
  ]);

  // Cultura e Lazer
  await knex("online_benefits").insert([
    {
      id: 6,
      title: "Sorteios trimestrais de ingressos",
      partner_name: "Estágio Plus",
      category_id: 3, // Cultura e Lazer
      details: "Sorteios de ingressos de cinema ou eventos a cada trimestre.",
      discount_label: "Sorteio",
      logo: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963f?q=80&w=1200&auto=format&fit=crop",
      phone: "+55 85 90000-8888",
      website: "https://sorteios.estagioplus.example.com",
      availability_scope: "NATIONAL",
      states: null,
      cities: null,
    },
  ]);
}
