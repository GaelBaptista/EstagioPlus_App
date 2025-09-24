import { Knex } from "knex";

export async function up(knex: Knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();

    table.string("name").notNullable();
    table.string("cpf").nullable(); // pode ser null por enquanto
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();

    table.integer("points").notNullable().defaultTo(0);
    table.integer("next_level").notNullable().defaultTo(1000);
    table.string("level").notNullable().defaultTo("Bronze");
    table.string("avatar_url").nullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable("users");
}
