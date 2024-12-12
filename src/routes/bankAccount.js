import { Router } from 'express';
import knex from '../config/db.js';
import  generateAccountNumber  from '../utils/generateAccountNumber.js'; // Utility for generating account numbers
const router = Router();

// Generate Bank Account
router.post('/create', async (req, res) => {
  try {
    const { userId, bankName } = req.body;

    // Validate input
    if (!userId || !bankName) {
      return res.status(400).json({ message: 'User ID and Bank Name are required' });
    }

    // Check if user exists
    const user = await knex('users').where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a unique account number
    let accountNumber;
    let isUnique = false;
    while (!isUnique) {
      accountNumber = generateAccountNumber(); // Random account number generation
      const existingAccount = await knex('bank_accounts').where({ account_number: accountNumber }).first();
      if (!existingAccount) {
        isUnique = true;
      }
    }

    // Create a new bank account
    const [accountId] = await knex('bank_accounts').insert({
      user_id: userId,
      account_number: accountNumber,
      bank_name: bankName,
    });

    return res.status(201).json({
      message: 'Bank account created successfully',
      accountId,
      accountNumber,
      bankName,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
