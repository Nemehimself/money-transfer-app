/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('transactions', (table) => {
        table.increments('id').primary();
        table.string('transaction_id').notNullable().unique();
        table.string('account_number').notNullable().references('account_number').inTable('bank_accounts').onDelete('CASCADE');
        table.enu('type', ['deposit', 'withdrawal', 'transfer']).notNullable();
        table.decimal('amount', 15, 2).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('transactions');
};
