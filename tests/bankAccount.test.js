const request = require('supertest');
const app = require('../src/app');
const knex = require('../src/config/db');

beforeAll(async () => {
  await knex.migrate.latest();
  await knex('users').del();
  await knex('bank_accounts').del();

  // Insert a test user
  await knex('users').insert({
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });
});

afterAll(async () => {
  await knex.destroy();
});

describe('Bank Account', () => {
  test('Create a bank account for a user', async () => {
    const response = await request(app)
      .post('/api/bank-account/create')
      .send({
        userId: 1,
        bankName: 'Raven Bank',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('accountId');
    expect(response.body).toHaveProperty('accountNumber');
    expect(response.body.message).toBe('Bank account created successfully');
  });

  test('Fail to create a bank account for non-existing user', async () => {
    const response = await request(app)
      .post('/api/bank-account/create')
      .send({
        userId: 99,
        bankName: 'Raven Bank',
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
