import { Knex } from "knex";

export async function up(knex: Knex) {
  return knex.schema.createTable("online_benefits", (table) => {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.string("partner_name").notNullable();
    table.integer("category_id").nullable().references("id").inTable("items");
    table.string("details").nullable();
    table.string("discount_label").nullable();
    table.string("logo").nullable();  // arquivo/URL
    table.string("image").nullable(); // arquivo/URL
    table.string("phone").nullable();
    table.string("website").nullable();
    table.string("availability_scope").notNullable().defaultTo("NATIONAL"); // NATIONAL | STATE | CITY
    table.string("states").nullable(); // "CE,PE"
    table.string("cities").nullable(); // "Pacajus:CE,Fortaleza:CE"
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable("online_benefits");
}
