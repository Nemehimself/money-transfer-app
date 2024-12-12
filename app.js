import express from "express";
import json  from "body-parser";
import authRoutes from './src/routes/auth.js';
import bankAccountRoutes from './src/routes/bankAccount.js';
import webhooksRoutes from './src/routes/webhooks.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(json());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/bank-account", bankAccountRoutes);
app.use('/api/webhooks', webhooksRoutes);

app.post("/signup", (_req, res) => {
  res.json({ message: "User signed up!" });
});

app.post("/login", (_req, res) => {
  res.json({ message: "User logged in!" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
