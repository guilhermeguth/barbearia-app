import { Request, Response } from "express";
import { SettingService } from "../repositories/settingRepository";
import { EmailService } from "../services/emailService";
import { BadRequestError } from "../helpers/api-errors";

export class SettingsController {
  test(_req: Request, res: Response) {
    res.status(200).json({ message: "Settings controller funcionando!" });
  }

  async getSettings(_req: Request, res: Response) {
    try {
      console.log("🔍 Tentando buscar configurações...");
      const settings = await SettingService.getAllSettings();
      console.log("✅ Configurações encontradas:", Object.keys(settings));

      res.status(200).json({
        settings,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Erro ao buscar configurações:", error);
      res.status(500).json({
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  async getSmtpConfig(_req: Request, res: Response) {
    try {
      const config = await SettingService.getSmtpConfig();

      // Retornar senha vazia para o frontend indicar que precisa ser reinserida
      // se uma senha existir no banco
      res.status(200).json({
        ...config,
        pass: "", // Sempre retornar vazio para forçar nova entrada
        hasPassword: !!config.pass, // Indicar se existe senha salva
      });
    } catch (error) {
      console.error("Erro ao buscar configurações SMTP:", error);
      throw new BadRequestError("Erro ao buscar configurações de email");
    }
  }

  async updateSmtpConfig(req: Request, res: Response) {
    try {
      const { host, port, user, pass, secure } = req.body;

      if (!host || !port || !user) {
        throw new BadRequestError("Host, porta e usuário são obrigatórios");
      }

      // Se a senha está vazia, manter a senha existente
      let finalPassword = pass;
      if (!pass || pass.trim() === "") {
        const currentConfig = await SettingService.getSmtpConfig();
        finalPassword = currentConfig.pass;
      }

      await SettingService.setSmtpConfig({
        host,
        port: parseInt(port),
        user,
        pass: finalPassword,
        secure: Boolean(secure),
      });

      // Reset do transporter para usar as novas configurações
      EmailService.resetTransporter();

      res.status(200).json({
        message: "Configurações de email atualizadas com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar configurações SMTP:", error);
      throw new BadRequestError("Erro ao atualizar configurações de email");
    }
  }

  async testSmtpConnection(req: Request, res: Response) {
    try {
      const configToTest = req.body;

      if (!configToTest.host || !configToTest.port || !configToTest.user) {
        res.status(400).json({
          message:
            "Host, porta e usuário são obrigatórios para testar a conexão",
          success: false,
        });
        return;
      }

      // Se não foi fornecida senha, usar a configuração salva
      const finalConfig = configToTest.pass
        ? configToTest
        : await SettingService.getSmtpConfig();

      if (!finalConfig.pass) {
        res.status(400).json({
          message: "Senha é obrigatória para testar a conexão",
          success: false,
        });
        return;
      }

      // Temporariamente atualizar as configurações para o teste
      const originalConfig = await SettingService.getSmtpConfig();
      await SettingService.setSmtpConfig(finalConfig);

      // Reset do transporter para usar as novas configurações
      EmailService.resetTransporter();

      try {
        // Usar o novo serviço de email para verificar conexão
        const result = await EmailService.verifyConnection();

        if (result.success) {
          res.status(200).json({
            message: "Conexão SMTP testada com sucesso",
            success: true,
          });
        } else {
          res.status(400).json({
            message: `Falha ao conectar: ${
              result.error || "Erro desconhecido"
            }`,
            success: false,
          });
        }
      } finally {
        // Restaurar as configurações originais se foram diferentes
        if (JSON.stringify(originalConfig) !== JSON.stringify(finalConfig)) {
          await SettingService.setSmtpConfig(originalConfig);
          EmailService.resetTransporter();
        }
      }
    } catch (error) {
      console.error("Erro ao testar configurações SMTP:", error);
      res.status(500).json({
        message: "Erro interno do servidor ao testar SMTP",
        success: false,
      });
    }
  }

  async sendTestEmail(req: Request, res: Response) {
    try {
      const { config, testEmail } = req.body;

      if (!config || !testEmail) {
        res.status(400).json({
          message: "Configuração SMTP e email de teste são obrigatórios",
          success: false,
        });
        return;
      }

      if (!config.host || !config.port || !config.user) {
        res.status(400).json({
          message: "Host, porta e usuário são obrigatórios",
          success: false,
        });
        return;
      }

      // Se não tem senha no config, usar a senha salva
      const finalConfig = { ...config };
      if (!config.pass || config.pass.trim() === "") {
        const savedConfig = await SettingService.getSmtpConfig();
        finalConfig.pass = savedConfig.pass;
      }

      if (!finalConfig.pass) {
        res.status(400).json({
          message: "Senha é obrigatória para envio de teste",
          success: false,
        });
        return;
      }

      // Temporariamente atualizar as configurações para o teste
      const originalConfig = await SettingService.getSmtpConfig();
      await SettingService.setSmtpConfig(finalConfig);

      // Reset do transporter para usar as novas configurações
      EmailService.resetTransporter();

      try {
        // Usar o novo serviço de email
        const result = await EmailService.sendTemplatedEmail(
          "testConnection",
          testEmail,
          {
            configTested: {
              host: finalConfig.host,
              port: finalConfig.port,
              user: finalConfig.user,
              secure: finalConfig.secure,
            },
          },
        );

        if (result.success) {
          res.status(200).json({
            message: `Email de teste enviado com sucesso para ${testEmail}`,
            success: true,
            messageId: result.messageId,
          });
        } else {
          res.status(400).json({
            message: `Falha ao enviar email: ${
              result.error || "Erro desconhecido"
            }`,
            success: false,
          });
        }
      } finally {
        // Restaurar as configurações originais se foram diferentes
        if (JSON.stringify(originalConfig) !== JSON.stringify(finalConfig)) {
          await SettingService.setSmtpConfig(originalConfig);
          EmailService.resetTransporter();
        }
      }
    } catch (error) {
      console.error("Erro ao enviar email de teste:", error);
      res.status(500).json({
        message: "Erro interno do servidor ao enviar email de teste",
        success: false,
      });
    }
  }

  async initializeSettings(_req: Request, res: Response) {
    try {
      await SettingService.initializeDefaultSettings();

      res.status(200).json({
        message: "Configurações padrão inicializadas com sucesso",
      });
    } catch (error) {
      console.error("Erro ao inicializar configurações:", error);
      throw new BadRequestError("Erro ao inicializar configurações");
    }
  }
}
