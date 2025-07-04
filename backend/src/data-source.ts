import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";

const port = process.env.DB_PORT
  ? parseInt(process.env.DB_PORT, 10)
  : undefined;

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: port,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [`${__dirname}/**/**/entities/*.{ts,js}`],
  migrations: [`${__dirname}/**/**/migrations/*.{ts,js}`],
  synchronize: false, // importante deixar false para usar migrações
});

export default AppDataSource;
