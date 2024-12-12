import { Router } from 'express';
import knex from '../config/db.js';
import axios from 'axios'; // For making HTTP requests to the Raven Atlas API

const router = Router();

// Transfer funds to another bank
router.post('/transfer', async (req, res) => {
  const { senderAccountNumber, receiverBankCode, receiverAccountNumber, amount, narration } = req.body;

  // Validate input
  if (!senderAccountNumber || !receiverBankCode || !receiverAccountNumber || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
    // Fetch the sender's account
    const senderAccount = await knex('bank_accounts').where({ account_number: senderAccountNumber }).first();
    if (!senderAccount) {
      return res.status(404).json({ message: 'Sender account not found' });
    }

    // Check if the sender has enough balance
    if (senderAccount.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Call Raven Atlas API for the transfer
    const atlasResponse = await axios.post(
      'https://api.getravenbank.com/v1/transfer', // Raven Atlas transfer endpoint
      {
        sender_account_number: senderAccountNumber,
        receiver_bank_code: receiverBankCode,
        receiver_account_number: receiverAccountNumber,
        amount,
        narration: narration || 'Money Transfer',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RAVEN_API_KEY}`, // Use your Raven Atlas API key
          'Content-Type': 'application/json',
        },
      }
    );

    if (atlasResponse.status !== 200 || atlasResponse.data.status !== 'success') {
      return res.status(400).json({ message: 'Transfer failed', error: atlasResponse.data });
    }

    // Update sender's balance and log the transaction
    await knex.transaction(async (trx) => {
      await trx('bank_accounts')
        .where({ account_number: senderAccountNumber })
        .decrement('balance', amount);

      await trx('transactions').insert({
        transaction_id: atlasResponse.data.data.transaction_reference,
        account_number: senderAccountNumber,
        type: 'transfer',
        amount: -amount,
        created_at: knex.fn.now(),
      });
    });

    return res.status(200).json({ message: 'Transfer successful', data: atlasResponse.data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.response?.data || error.message 
    });
  }
});

export default router;
