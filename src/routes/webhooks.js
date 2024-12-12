import { Router } from 'express';
import knex from '../config/db.js';

const router = Router();

// Webhook to handle deposit notifications
router.post('/deposit-notification', async (req, res) => {
  try {
    const { accountNumber, amount, transactionId } = req.body;

    // Validate the payload
    if (!accountNumber || !amount || !transactionId) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    // Find the bank account
    const account = await knex('bank_accounts').where({ account_number: accountNumber }).first();
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    // Check if the transaction is already processed
    const existingTransaction = await knex('transactions').where({ transaction_id: transactionId }).first();
    if (existingTransaction) {
      return res.status(200).json({ message: 'Transaction already processed' });
    }

    // Update the balance and log the transaction
    await transaction(async (trx) => {
      await trx('bank_accounts')
        .where({ account_number: accountNumber })
        .increment('balance', amount);

      await trx('transactions').insert({
        transaction_id: transactionId,
        account_number: accountNumber,
        type: 'deposit',
        amount,
        created_at: fn.now(),
      });
    });

    return res.status(200).json({ message: 'Deposit processed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
