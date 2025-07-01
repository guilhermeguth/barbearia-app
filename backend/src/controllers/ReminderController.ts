import { Request, Response } from "express";

export class ReminderController {
  // Verificar status dos lembretes
  getStatus(_req: Request, res: Response) {
    try {
      console.log("🔍 Verificando status dos lembretes...");
      const { ReminderService } = require("../services/reminderService");
      const status = ReminderService.getStatus();
      console.log("✅ Status obtido:", status);
      res.status(200).json(status);
    } catch (error) {
      console.error("❌ Erro ao verificar status dos lembretes:", error);
      res.status(500).json({
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Executar teste de lembretes
  async runTest(_req: Request, res: Response) {
    try {
      console.log("🧪 Iniciando teste de lembretes...");
      const { ReminderService } = require("../services/reminderService");
      await ReminderService.runTestReminders();
      console.log("✅ Teste de lembretes concluído");

      res.status(200).json({
        message: "Teste de lembretes executado com sucesso",
        note: "Verifique os logs do servidor para detalhes",
      });
    } catch (error) {
      console.error("❌ Erro ao executar teste de lembretes:", error);
      res.status(500).json({
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
