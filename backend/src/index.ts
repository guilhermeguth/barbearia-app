import "express-async-errors";
import express from "express";
import cors from "cors";
import path from "path";
import AppDataSource from "./data-source";
import routes from "./routes";
import errorMiddleware from "./middlewares/error";
import { SettingService } from "./repositories/settingRepository";

AppDataSource.initialize().then(async () => {
  const app = express();

  // Inicializar configurações padrão
  try {
    await SettingService.initializeDefaultSettings();
  } catch (error) {
    console.error("Erro ao inicializar configurações padrão:", error);
  }

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

  // Servir arquivos estáticos (fotos)
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.use(routes);

  app.use(errorMiddleware);

  return app.listen(process.env.PORT, () => {
    console.log(`Server rodando na porta ${process.env.PORT}`);
  });
});
