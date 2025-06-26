import "express-async-errors";
import express from "express";
import cors from "cors";
import AppDataSource from "./data-source";
import routes from "./routes";
import errorMiddleware from "./middlewares/error";

AppDataSource.initialize().then(() => {
  const app = express();

  app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }));

  app.options("*", (_req, res) => {
    res.sendStatus(200);
  });

  app.use(express.json());

  app.use(routes);

  app.use(errorMiddleware);

  return app.listen(process.env.PORT, () => {
    console.log(`Server rodando na porta ${process.env.PORT}`);
  });
});
