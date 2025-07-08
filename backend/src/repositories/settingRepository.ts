import AppDataSource from "../data-source";
import { Setting } from "../entities/Setting";
import * as nodemailer from "nodemailer";

const getSettingRepository = () => AppDataSource.getRepository(Setting);

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
}

export interface GeneralConfig {
  businessName: string;
  primaryColor: string;
}

export class SettingService {
  static async getSetting(key: string): Promise<string | null> {
    const setting = await getSettingRepository().findOneBy({ key });
    return setting ? setting.value : null;
  }

  static async setSetting(
    key: string,
    value: string,
    description?: string,
    isEncrypted: boolean = false,
  ): Promise<Setting> {
    let setting = await getSettingRepository().findOneBy({ key });

    if (setting) {
      setting.value = value;
      setting.description = description || setting.description;
      setting.isEncrypted = isEncrypted;
      setting.updatedAt = new Date();
    } else {
      setting = getSettingRepository().create({
        key,
        value,
        description,
        isEncrypted,
      });
    }

    return await getSettingRepository().save(setting);
  }

  static async getAllSettings(): Promise<Record<string, any>> {
    const settings = await getSettingRepository().find();
    const result: Record<string, any> = {};

    settings.forEach((setting: Setting) => {
      // Não retornar senhas e dados criptografados
      if (!setting.isEncrypted) {
        result[setting.key] = setting.value;
      }
    });

    return result;
  }

  // SMTP Configuration
  static async getSmtpConfig(): Promise<SmtpConfig> {
    const [host, port, user, pass, secure] = await Promise.all([
      this.getSetting("smtp_host"),
      this.getSetting("smtp_port"),
      this.getSetting("smtp_user"),
      this.getSetting("smtp_pass"),
      this.getSetting("smtp_secure"),
    ]);

    return {
      host: host || "smtp.gmail.com",
      port: parseInt(port || "587"),
      secure: secure === "true",
      user: user || "",
      pass: pass || "",
    };
  }

  static async setSmtpConfig(config: SmtpConfig): Promise<void> {
    await Promise.all([
      this.setSetting("smtp_host", config.host, "Servidor SMTP"),
      this.setSetting("smtp_port", config.port.toString(), "Porta SMTP"),
      this.setSetting("smtp_user", config.user, "Usuário SMTP"),
      this.setSetting("smtp_pass", config.pass, "Senha SMTP", true),
      this.setSetting("smtp_secure", config.secure.toString(), "SSL/TLS ativo"),
    ]);
  }

  // Testar conexão SMTP
  static async testSmtpConnection(
    configToTest?: SmtpConfig,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const config = configToTest || await this.getSmtpConfig();

      console.log("Testando SMTP com configuração:", {
        host: config.host,
        port: config.port,
        user: config.user,
        secure: config.secure,
        hasPassword: !!config.pass,
      });

      if (!config.host || !config.user || !config.pass) {
        throw new Error("Configurações SMTP incompletas");
      }

      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });

      await transporter.verify();
      console.log("✅ Teste SMTP bem-sucedido");
      return { success: true };
    } catch (error) {
      console.error("❌ Erro ao testar SMTP:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  // Enviar email de teste
  static async sendTestEmail(
    configToTest: SmtpConfig,
    testEmail: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!testEmail || !testEmail.includes("@")) {
        throw new Error("Email de teste inválido");
      }

      const config = configToTest;

      if (!config.host || !config.user || !config.pass) {
        throw new Error("Configurações SMTP incompletas");
      }

      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });

      // Primeiro verificar a conexão
      await transporter.verify();

      // Depois enviar o email de teste
      const mailOptions = {
        from: config.user,
        to: testEmail,
        subject: "Teste de Configuração SMTP - Sistema Barbearia",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">🎉 Teste de Email Bem-sucedido!</h2>
            <p>Este é um email de teste do <strong>Sistema de Barbearia</strong>.</p>
            <p>Se você recebeu este email, significa que as configurações SMTP estão funcionando corretamente.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #28a745; margin: 0 0 10px 0;">✅ Configurações Testadas:</h3>
              <ul style="margin: 0;">
                <li><strong>Servidor:</strong> ${config.host}</li>
                <li><strong>Porta:</strong> ${config.port}</li>
                <li><strong>Segurança:</strong> ${
          config.secure ? "SSL/TLS" : "STARTTLS"
        }</li>
                <li><strong>Usuário:</strong> ${config.user}</li>
              </ul>
            </div>
            
            <p style="color: #6c757d; font-size: 14px;">
              Data do teste: ${new Date().toLocaleString("pt-BR")}
            </p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
            <p style="color: #6c757d; font-size: 12px; text-align: center;">
              Este é um email automático do Sistema de Barbearia. Não responda a este email.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ Email de teste enviado com sucesso para:", testEmail);

      return { success: true };
    } catch (error) {
      console.error("❌ Erro ao enviar email de teste:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  // General Configuration
  static async getGeneralConfig(): Promise<GeneralConfig> {
    const [businessName, primaryColor] = await Promise.all([
      this.getSetting("business_name"),
      this.getSetting("primary_color"),
    ]);

    return {
      businessName: businessName || "Barbearia",
      primaryColor: primaryColor || "#1976D2",
    };
  }

  static async setGeneralConfig(config: GeneralConfig): Promise<void> {
    await Promise.all([
      this.setSetting(
        "business_name",
        config.businessName,
        "Nome da Barbearia",
      ),
      this.setSetting(
        "primary_color",
        config.primaryColor,
        "Cor Principal do Sistema",
      ),
    ]);
  }

  // Inicializar configurações padrão
  static async initializeDefaultSettings(): Promise<void> {
    const existingSettings = await getSettingRepository().count();

    if (existingSettings === 0) {
      // Configurações básicas de SMTP
      await this.setSmtpConfig({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        user: "",
        pass: "",
      });

      // Configurações gerais padrão
      await this.setGeneralConfig({
        businessName: "Barbearia",
        primaryColor: "#1976D2",
      });

      console.log("✅ Configurações padrão inicializadas");
    }
  }
}
