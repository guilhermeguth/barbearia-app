import { EmailService } from "../services/emailService";
import { SettingService } from "../repositories/settingRepository";
import { Appointment } from "../entities/Appointment";

export class NotificationService {
  /**
   * Verifica se as configurações de email estão disponíveis
   */
  private static async isEmailConfigured(): Promise<boolean> {
    try {
      const config = await SettingService.getSmtpConfig();
      return !!(config.host && config.user && config.pass);
    } catch (error) {
      console.warn("⚠️ Erro ao verificar configurações de email:", error);
      return false;
    }
  }

  /**
   * Obtém o email do cliente (prioriza email direto, depois user.email)
   */
  private static getCustomerEmail(appointment: Appointment): string | null {
    return appointment.customer?.email || appointment.customer?.user?.email ||
      null;
  }

  /**
   * Envia notificação de agendamento confirmado
   */
  static async sendAppointmentConfirmation(
    appointment: Appointment,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar se email está configurado
      if (!await this.isEmailConfigured()) {
        console.warn(
          "⚠️ Configurações de email não encontradas - pulando envio de notificação",
        );
        return {
          success: false,
          error: "Configurações de email não configuradas",
        };
      }

      const customerEmail = this.getCustomerEmail(appointment);
      if (!customerEmail) {
        console.warn("⚠️ Cliente não possui email cadastrado para notificação");
        return { success: false, error: "Cliente não possui email cadastrado" };
      }

      const result = await EmailService.sendTemplatedEmail(
        "appointmentConfirmed",
        customerEmail,
        appointment,
      );

      if (result.success) {
        console.log("✅ Notificação de confirmação enviada:", {
          customer: appointment.customer?.name,
          email: customerEmail,
          appointment: appointment.id,
        });
      }

      return result;
    } catch (error) {
      console.error("❌ Erro ao enviar notificação de confirmação:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Envia notificação de agendamento cancelado
   */
  static async sendAppointmentCancellation(
    appointment: Appointment,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar se email está configurado
      if (!await this.isEmailConfigured()) {
        console.warn(
          "⚠️ Configurações de email não encontradas - pulando envio de notificação",
        );
        return {
          success: false,
          error: "Configurações de email não configuradas",
        };
      }

      const customerEmail = this.getCustomerEmail(appointment);
      if (!customerEmail) {
        console.warn("⚠️ Cliente não possui email cadastrado para notificação");
        return { success: false, error: "Cliente não possui email cadastrado" };
      }

      const result = await EmailService.sendTemplatedEmail(
        "appointmentCancelled",
        customerEmail,
        appointment,
      );

      if (result.success) {
        console.log("✅ Notificação de cancelamento enviada:", {
          customer: appointment.customer?.name,
          email: customerEmail,
          appointment: appointment.id,
        });
      }

      return result;
    } catch (error) {
      console.error("❌ Erro ao enviar notificação de cancelamento:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Envia lembrete de agendamento
   */
  static async sendAppointmentReminder(
    appointment: Appointment,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar se email está configurado
      if (!await this.isEmailConfigured()) {
        console.warn(
          "⚠️ Configurações de email não encontradas - pulando envio de lembrete",
        );
        return {
          success: false,
          error: "Configurações de email não configuradas",
        };
      }

      const customerEmail = this.getCustomerEmail(appointment);
      if (!customerEmail) {
        console.warn("⚠️ Cliente não possui email cadastrado para lembrete");
        return { success: false, error: "Cliente não possui email cadastrado" };
      }

      const result = await EmailService.sendTemplatedEmail(
        "appointmentReminder",
        customerEmail,
        appointment,
      );

      if (result.success) {
        console.log("✅ Lembrete de agendamento enviado:", {
          customer: appointment.customer?.name,
          email: customerEmail,
          appointment: appointment.id,
        });
      }

      return result;
    } catch (error) {
      console.error("❌ Erro ao enviar lembrete de agendamento:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Verifica se as notificações por email estão habilitadas
   */
  static async areEmailNotificationsEnabled(): Promise<boolean> {
    try {
      return await this.isEmailConfigured();
    } catch (error) {
      console.warn("⚠️ Notificações por email não estão disponíveis:", error);
      return false;
    }
  }

  /**
   * Envia notificação de teste para verificar funcionamento
   */
  static async sendTestNotification(
    email: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await EmailService.sendTemplatedEmail(
        "testConnection",
        email,
        {
          testType: "notification_service",
          timestamp: new Date().toISOString(),
        },
      );

      if (result.success) {
        console.log("✅ Notificação de teste enviada:", { email });
      }

      return result;
    } catch (error) {
      console.error("❌ Erro ao enviar notificação de teste:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }
}
