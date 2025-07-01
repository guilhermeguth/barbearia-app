import * as nodemailer from "nodemailer";
import { SettingService } from "../repositories/settingRepository";
import { EmailTemplates } from "./emailTemplates";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Inicializa o transporter com as configurações SMTP atuais
   */
  private static async initializeTransporter(): Promise<
    nodemailer.Transporter
  > {
    const config = await SettingService.getSmtpConfig();

    if (!config.host || !config.user || !config.pass) {
      throw new Error("Configurações SMTP não encontradas ou incompletas");
    }

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    return this.transporter;
  }

  /**
   * Obtém ou cria um transporter válido
   */
  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      this.transporter = await this.initializeTransporter();
    }
    return this.transporter;
  }

  /**
   * Redefine o transporter (útil quando as configurações mudam)
   */
  public static resetTransporter(): void {
    this.transporter = null;
  }

  /**
   * Envia um email usando as configurações SMTP do sistema
   */
  public static async sendEmail(
    options: EmailOptions,
  ): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      const transporter = await this.getTransporter();
      const config = await SettingService.getSmtpConfig();

      const mailOptions = {
        from: options.from || config.user,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await transporter.sendMail(mailOptions);

      console.log("✅ Email enviado com sucesso:", {
        to: mailOptions.to,
        subject: mailOptions.subject,
        messageId: result.messageId,
      });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("❌ Erro ao enviar email:", error);

      // Reset transporter em caso de erro (pode ter mudado as configurações)
      this.resetTransporter();

      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Verifica se as configurações SMTP são válidas testando a conexão
   */
  public static async verifyConnection(): Promise<
    { success: boolean; error?: string }
  > {
    try {
      const transporter = await this.getTransporter();
      await transporter.verify();

      console.log("✅ Configurações SMTP verificadas com sucesso");
      return { success: true };
    } catch (error) {
      console.error("❌ Erro na verificação SMTP:", error);

      // Reset transporter em caso de erro
      this.resetTransporter();

      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Templates de email pré-definidos com design moderno
   */
  private static getEmailTemplates() {
    return {
      test: EmailTemplates.testConnection,
      testConnection: EmailTemplates.testConnection,
      appointmentConfirmed: EmailTemplates.appointmentConfirmed,
      appointmentCancelled: EmailTemplates.appointmentCancelled,
      appointmentReminder: EmailTemplates.appointmentReminder,
    };
  }

  /**
   * Envia um email usando um template pré-definido
   */
  public static async sendTemplatedEmail(
    templateName: keyof ReturnType<typeof EmailService.getEmailTemplates>,
    to: string | string[],
    data?: any,
  ): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      const templates = this.getEmailTemplates();
      const template = templates[templateName](data);

      return await this.sendEmail({
        to,
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      console.error(
        `❌ Erro ao enviar email com template ${templateName}:`,
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Envia um email de teste de conexão SMTP
   */
  public static async sendTestEmail(
    to: string | string[],
    testData?: any,
  ): Promise<{ success: boolean; error?: string; messageId?: string }> {
    return await this.sendTemplatedEmail("testConnection", to, testData);
  }

  /**
   * Envia email de confirmação de agendamento
   */
  public static async sendAppointmentConfirmation(
    to: string | string[],
    appointment: any,
  ): Promise<{ success: boolean; error?: string; messageId?: string }> {
    return await this.sendTemplatedEmail(
      "appointmentConfirmed",
      to,
      appointment,
    );
  }

  /**
   * Envia email de cancelamento de agendamento
   */
  public static async sendAppointmentCancellation(
    to: string | string[],
    appointment: any,
  ): Promise<{ success: boolean; error?: string; messageId?: string }> {
    return await this.sendTemplatedEmail(
      "appointmentCancelled",
      to,
      appointment,
    );
  }

  /**
   * Envia email de lembrete de agendamento
   */
  public static async sendAppointmentReminder(
    to: string | string[],
    appointment: any,
  ): Promise<{ success: boolean; error?: string; messageId?: string }> {
    return await this.sendTemplatedEmail(
      "appointmentReminder",
      to,
      appointment,
    );
  }
}
