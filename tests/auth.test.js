import request from "supertest";
import app from "../app";
import knex, { migrate, destroy } from "../src/config/db";

const { knex, migrate } = require("../knex"); // Adjust the path as needed

beforeAll(async () => {
  await migrate.latest();
  await knex("users").del(); // Clear the test database
});

afterAll(async () => {
  await knex.destroy(); // Close the connection
});

describe("Authentication", () => {
  test("Sign up a new user", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("userId");
  });

  test("Log in with existing user", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("userId");
  });

  test("Fail login with incorrect password", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid credentials");
  });
});
