import { Knex } from "knex";

export async function up(knex: Knex) {
  await knex.schema.alterTable("users", (t) => {
    t.date("contract_start_date").nullable();
    t.date("contract_end_date").nullable();
    t.integer("daily_points_rate").notNullable().defaultTo(2800); // ~1M/365
    t.integer("points_base").notNullable().defaultTo(0);          // pontos já consolidados
    t.date("last_accrual_date").nullable();                       // última vez que creditou diário
  });
}

export async function down(knex: Knex) {
  await knex.schema.alterTable("users", (t) => {
    t.dropColumn("contract_start_date");
    t.dropColumn("contract_end_date");
    t.dropColumn("daily_points_rate");
    t.dropColumn("points_base");
    t.dropColumn("last_accrual_date");
  });
}
