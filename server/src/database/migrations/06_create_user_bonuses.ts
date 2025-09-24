import { Knex } from "knex";

export async function up(knex: Knex) {
  await knex.schema.createTable("user_bonuses", (t) => {
    t.increments("id").primary();
    t.integer("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.string("code").notNullable();           // ex: MONTH-2025-10, NO-ABSENCE-2025-10
    t.integer("points").notNullable();
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.unique(["user_id", "code"]);
  });
}

export async function down(knex: Knex) {
  await knex.schema.dropTable("user_bonuses");
}
