import request from 'supertest';
import app from '../src/app';
import knex from '../src/config/db';

beforeAll(async () => {
  await migrate.latest();
  await knex('bank_accounts').del();
  await knex('transactions').del();

  // Insert a test bank account
  await knex('bank_accounts').insert({
    id: 1,
    user_id: 1,
    account_number: '1234567890',
    bank_name: 'Raven Bank',
    balance: 0,
  });
});

afterAll(async () => {
  await destroy();
});

describe('Webhook: Deposit Notification', () => {
  test('Process a deposit notification', async () => {
    const response = await request(app)
      .post('/api/webhooks/deposit-notification')
      .send({
        accountNumber: '1234567890',
        amount: 1000,
        transactionId: 'txn_001',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Deposit processed successfully');

    // Check updated balance
    const account = await knex('bank_accounts').where({ account_number: '1234567890' }).first();
    expect(account.balance).toBe(1000);

    // Check transaction log
    const transaction = await knex('transactions').where({ transaction_id: 'txn_001' }).first();
    expect(transaction).not.toBeUndefined();
  });

  test('Reject duplicate transaction', async () => {
    const response = await request(app)
      .post('/api/webhooks/deposit-notification')
      .send({
        accountNumber: '1234567890',
        amount: 1000,
        transactionId: 'txn_001',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Transaction already processed');
  });
});
