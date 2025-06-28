import "express-async-errors";
import express from "express";
import cors from "cors";
import AppDataSource from "./data-source";
import routes from "./routes";
import errorMiddleware from "./middlewares/error";

AppDataSource.initialize().then(() => {
  const app = express();

  app.use(cors({
    origin: function (origin, callback) {
      // Permitir requisições sem origin (ex: mobile apps, postman)
      if (!origin) return callback(null, true);

      // Permitir qualquer localhost durante desenvolvimento
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true);
      }

      // Em produção, você deve especificar domínios específicos
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
