import dotenv from 'dotenv';
dotenv.config();

export default {
  client: 'mysql2', // Use mysql2 as the client
  connection: {
    host: '127.0.0.1', // MySQL server address
    user: 'root', // MySQL username
    password: '1111', // MySQL password
    database: 'money_transfer', // Database name
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations', // Path where migrations are stored
  },
};
