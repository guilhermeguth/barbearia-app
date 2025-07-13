import "express-async-errors";
import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import path from "path";
import AppDataSource from "./data-source";
import routes from "./routes";
import errorMiddleware from "./middlewares/error";
import { SettingService } from "./repositories/settingRepository";
import { ReminderService } from "./services/reminderService";

AppDataSource.initialize().then(async () => {
  const app = express();
  dotenv.config();

  // Inicializar configurações padrão
  try {
    await SettingService.initializeDefaultSettings();
    console.log("✅ Configurações padrão inicializadas");
  } catch (error) {
    console.error("❌ Erro ao inicializar configurações padrão:", error);
  }

  // Inicializar serviço de lembretes automáticos
  try {
    ReminderService.start();
    console.log("✅ Serviço de lembretes automáticos iniciado");
  } catch (error) {
    console.error("❌ Erro ao inicializar serviço de lembretes:", error);
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
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.use(routes);

  const PORT = Number(process.env.PORT) || 3001;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server rodando na porta ${PORT}`);
  });
});
