import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_PORT = process.env.DATABASE_PORT;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_NAME = process.env.DATABASE_NAME;

const dbPowerbi = new Sequelize(
  DATABASE_NAME!,
  DATABASE_USER!,
  DATABASE_PASSWORD!,
  {
    host: DATABASE_HOST,
    port: Number(DATABASE_PORT),
    dialect: "mysql",
    timezone: "-05:00",
  },
);

export default dbPowerbi;
