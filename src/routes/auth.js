import { Router } from 'express';
import bcrypt from 'bcryptjs'; // Correct bcrypt import
import  sign  from 'jsonwebtoken';
import knex from '../config/db.js'; // Your Knex connection

const router = Router();

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await knex('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Insert user into database
    const [userId] = await knex('users').insert({
      name,
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(201).json({ token, userId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // Check if user exists
      const user = await knex('users').where({ email }).first();
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Generate token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      return res.status(200).json({ token, userId: user.id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

export default router;
