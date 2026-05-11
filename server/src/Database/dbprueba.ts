import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const PRUEBA_DATABASE_HOST = process.env.PRUEBA_DATABASE_HOST;
const PRUEBA_DATABASE_PORT = process.env.PRUEBA_DATABASE_PORT;
const PRUEBA_DATABASE_USER = process.env.PRUEBA_DATABASE_USER;
const PRUEBA_DATABASE_PASSWORD = process.env.PRUEBA_DATABASE_PASSWORD;
const PRUEBA_DATABASE_NAME = process.env.PRUEBA_DATABASE_NAME;

const dbPruebaPowerbi = new Sequelize(
  PRUEBA_DATABASE_NAME!,
  PRUEBA_DATABASE_USER!,
  PRUEBA_DATABASE_PASSWORD!,
  {
    host: PRUEBA_DATABASE_HOST,
    port: Number(PRUEBA_DATABASE_PORT),
    dialect: "mysql",
    timezone: "-05:00",
  },
);

export default dbPruebaPowerbi;
