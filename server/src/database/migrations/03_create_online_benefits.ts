import { Knex } from "knex";

export async function up(knex: Knex) {
  await knex.schema.createTable("online_benefits", (table) => {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.string("partner_name").notNullable();
    table.integer("category_id").references("id").inTable("items").onDelete("SET NULL");
    table.text("details").nullable();
    table.string("discount_label").nullable();
    table.string("logo").nullable();   // arquivo em /uploads ou URL
    table.string("image").nullable();  // opcional: banner
    table.string("website").nullable();
    table.string("phone").nullable();

    // disponibilidade
    table.string("availability_scope").notNullable().defaultTo("NATIONAL"); // NATIONAL | STATE | CITY
    table.string("states").nullable(); // CSV: "CE,RN"
    table.string("cities").nullable(); // CSV: "Fortaleza:CE,Natal:RN"

    // empresa (futuro)
    table.string("company_ids").nullable(); // CSV
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex) {
  await knex.schema.dropTable("online_benefits");
}
