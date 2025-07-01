import cron from "node-cron";
import { appointmentRepository } from "../repositories/appointmentRepository";
import { AppointmentStatus } from "../entities/Appointment";
import { NotificationService } from "./notificationService";
import { Between } from "typeorm";

export class ReminderService {
  private static isRunning = false;
  private static tasks: any[] = [];

  /**
   * Inicia o serviço de lembretes automáticos
   */
  static start() {
    if (this.isRunning) {
      console.log("🔄 Serviço de lembretes já está rodando");
      return;
    }

    console.log("🚀 Iniciando serviço de lembretes automáticos...");

    // Executa todos os dias às 09:00 para enviar lembretes do dia seguinte
    const task1 = cron.schedule("0 9 * * *", async () => {
      console.log("⏰ Executando verificação de lembretes...");
      await this.sendDailyReminders();
    });

    // Executa todos os dias às 18:00 para enviar lembretes do próximo dia útil
    const task2 = cron.schedule("0 18 * * *", async () => {
      console.log("⏰ Executando verificação de lembretes vespertinos...");
      await this.sendNextDayReminders();
    });

    this.tasks = [task1, task2];
    this.isRunning = true;
    console.log("✅ Serviço de lembretes automáticos iniciado com sucesso!");
  }

  /**
   * Para o serviço de lembretes automáticos
   */
  static stop() {
    this.tasks.forEach((task) => {
      if (task && typeof task.stop === "function") {
        task.stop();
      }
    });
    this.tasks = [];
    this.isRunning = false;
    console.log("⏹️ Serviço de lembretes parado");
  }

  /**
   * Envia lembretes para agendamentos do dia seguinte (às 09:00)
   */
  private static async sendDailyReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const appointments = await appointmentRepository.find({
        where: {
          scheduledDateTime: Between(tomorrow, dayAfterTomorrow),
          status: AppointmentStatus.SCHEDULED,
        },
        relations: ["customer", "barber", "service"],
      });

      console.log(
        `📧 Encontrados ${appointments.length} agendamentos para lembrete (amanhã)`,
      );

      for (const appointment of appointments) {
        try {
          // Verificar se o cliente tem email
          const customerEmail = appointment.customer?.email ||
            appointment.customer?.user?.email;
          if (!customerEmail) {
            console.warn(
              `⚠️ Cliente ${appointment.customer?.name} não possui email`,
            );
            continue;
          }

          const result = await NotificationService.sendAppointmentReminder(
            appointment,
          );

          if (result.success) {
            console.log(
              `✅ Lembrete enviado: ${appointment.customer?.name} - ${appointment.service?.name}`,
            );
          } else {
            console.warn(`⚠️ Falha ao enviar lembrete: ${result.error}`);
          }

          // Delay de 1 segundo entre envios para não sobrecarregar o SMTP
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(
            `❌ Erro ao enviar lembrete para agendamento ${appointment.id}:`,
            error,
          );
        }
      }
    } catch (error) {
      console.error("❌ Erro na execução dos lembretes diários:", error);
    }
  }

  /**
   * Envia lembretes para agendamentos do próximo dia útil (às 18:00)
   */
  private static async sendNextDayReminders() {
    try {
      const now = new Date();
      const nextWorkingDay = this.getNextWorkingDay(now);

      const startOfDay = new Date(nextWorkingDay);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(nextWorkingDay);
      endOfDay.setHours(23, 59, 59, 999);

      const appointments = await appointmentRepository.find({
        where: {
          scheduledDateTime: Between(startOfDay, endOfDay),
          status: AppointmentStatus.SCHEDULED,
        },
        relations: ["customer", "barber", "service"],
      });

      console.log(
        `📧 Encontrados ${appointments.length} agendamentos para lembrete (próximo dia útil)`,
      );

      for (const appointment of appointments) {
        try {
          const customerEmail = appointment.customer?.email ||
            appointment.customer?.user?.email;
          if (!customerEmail) {
            continue;
          }

          const result = await NotificationService.sendAppointmentReminder(
            appointment,
          );

          if (result.success) {
            console.log(
              `✅ Lembrete noturno enviado: ${appointment.customer?.name}`,
            );
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Erro ao enviar lembrete noturno:`, error);
        }
      }
    } catch (error) {
      console.error("❌ Erro na execução dos lembretes noturnos:", error);
    }
  }

  /**
   * Calcula o próximo dia útil (pula fins de semana)
   */
  private static getNextWorkingDay(date: Date): Date {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Se é sábado (6) ou domingo (0), pula para segunda
    while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
      nextDay.setDate(nextDay.getDate() + 1);
    }

    return nextDay;
  }

  /**
   * Envia lembrete manual para um agendamento específico
   */
  static async sendManualReminder(
    appointmentId: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const appointment = await appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ["customer", "barber", "service"],
      });

      if (!appointment) {
        return { success: false, error: "Agendamento não encontrado" };
      }

      if (appointment.status !== AppointmentStatus.SCHEDULED) {
        return { success: false, error: "Agendamento não está confirmado" };
      }

      const result = await NotificationService.sendAppointmentReminder(
        appointment,
      );
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Verifica status do serviço
   */
  static getStatus() {
    return {
      isRunning: this.isRunning,
      message: this.isRunning ? "Serviço ativo" : "Serviço parado",
      schedule: this.isRunning
        ? "Diariamente às 09:00 e 18:00"
        : "Não agendado",
    };
  }

  /**
   * Execução manual para teste (envia lembretes imediatamente)
   */
  static async runTestReminders() {
    console.log("🧪 Executando teste de lembretes...");
    await this.sendDailyReminders();
    console.log("✅ Teste de lembretes concluído");
  }
}
