import { Request, Response } from "express";
import { SettingService } from "../repositories/settingRepository";
import { BadRequestError } from "../helpers/api-errors";

export class SettingController {
  async getSmtpSettings(_req: Request, res: Response) {
    try {
      const config = await SettingService.getSmtpConfig();

      // Não retornar a senha por segurança
      res.status(200).json({
        host: config.host,
        port: config.port,
        user: config.user,
        secure: config.secure,
        hasPassword: !!config.pass,
      });
    } catch (error) {
      console.error("Erro ao buscar configurações SMTP:", error);
      throw new BadRequestError("Erro ao buscar configurações");
    }
  }

  async updateSmtpSettings(req: Request, res: Response) {
    try {
      const { host, port, user, pass, secure } = req.body;

      if (!host || !port || !user) {
        throw new BadRequestError("Host, porta e usuário são obrigatórios");
      }

      // Se não enviou senha, manter a atual
      let finalPass = pass;
      if (!pass) {
        const currentConfig = await SettingService.getSmtpConfig();
        finalPass = currentConfig.pass;
      }

      await SettingService.setSmtpConfig({
        host,
        port: parseInt(port),
        user,
        pass: finalPass,
        secure: secure === true || secure === "true",
      });

      res.status(200).json({
        message: "Configurações SMTP atualizadas com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar configurações SMTP:", error);
      throw new BadRequestError("Erro ao atualizar configurações");
    }
  }

  async testSmtpConnection(req: Request, res: Response) {
    try {
      const { testEmail } = req.body;

      if (!testEmail) {
        throw new BadRequestError("Email de teste é obrigatório");
      }

      const config = await SettingService.getSmtpConfig();

      if (!config.user || !config.pass) {
        throw new BadRequestError("Configurações SMTP não definidas");
      }

      // Importar nodemailer aqui para evitar erro se não estiver configurado
      const nodemailer = require("nodemailer");

      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });

      // Verificar conexão
      await transporter.verify();

      // Enviar email de teste
      await transporter.sendMail({
        from: config.user,
        to: testEmail,
        subject: "Teste de Configuração SMTP - Sistema Barbearia",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976D2;">Teste de Email</h2>
            <p>Parabéns! As configurações SMTP estão funcionando corretamente.</p>
            <p>Este é um email de teste enviado pelo Sistema da Barbearia.</p>
            <hr style="margin: 24px 0;">
            <p style="color: #666; font-size: 12px;">Sistema da Barbearia</p>
          </div>
        `,
      });

      res.status(200).json({
        message:
          "Email de teste enviado com sucesso! Verifique sua caixa de entrada.",
      });
    } catch (error: any) {
      console.error("Erro ao testar conexão SMTP:", error);
      throw new BadRequestError(
        `Erro ao testar conexão: ${error.message || "Erro desconhecido"}`,
      );
    }
  }
}
