import { Request, Response } from "express";
import { appointmentRepository } from "../repositories/appointmentRepository";
import { customerRepository } from "../repositories/customerRepository";
import { barberRepository } from "../repositories/barberRepository";
import { serviceRepository } from "../repositories/serviceRepository";
import { AppointmentStatus } from "../entities/Appointment";
import { BadRequestError, NotFoundError } from "../helpers/api-errors";
import { NotificationService } from "../services/notificationService";
import { ReminderService } from "../services/reminderService";

export class AppointmentController {
  // Listar todos os agendamentos
  async getAll(req: Request, res: Response) {
    try {
      const { date, barberId, customerId, status } = req.query;

      let query = appointmentRepository
        .createQueryBuilder("appointment")
        .leftJoinAndSelect("appointment.customer", "customer")
        .leftJoinAndSelect("appointment.barber", "barber")
        .leftJoinAndSelect("appointment.service", "service")
        .orderBy("appointment.scheduledDateTime", "ASC");

      // Filtros opcionais
      if (date) {
        query = query.andWhere("DATE(appointment.scheduledDateTime) = :date", {
          date,
        });
      }

      if (barberId) {
        query = query.andWhere("appointment.barberId = :barberId", {
          barberId,
        });
      }

      if (customerId) {
        query = query.andWhere("appointment.customerId = :customerId", {
          customerId,
        });
      }

      if (status) {
        query = query.andWhere("appointment.status = :status", { status });
      }

      const appointments = await query.getMany();

      // Converter preços de string para número
      const appointmentsWithNumberPrices = appointments.map((appointment) => ({
        ...appointment,
        totalPrice: parseFloat(appointment.totalPrice as any) || 0,
        service: appointment.service
          ? {
            ...appointment.service,
            price: parseFloat(appointment.service.price as any) || 0,
          }
          : null,
      }));

      res.status(200).json(appointmentsWithNumberPrices);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      res.status(500).json({
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Buscar agendamento por ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const appointment = await appointmentRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["customer", "barber", "service"],
      });

      if (!appointment) {
        throw new NotFoundError("Agendamento não encontrado");
      }

      // Converter preços de string para número
      const appointmentWithNumberPrices = {
        ...appointment,
        totalPrice: parseFloat(appointment.totalPrice as any) || 0,
        service: appointment.service
          ? {
            ...appointment.service,
            price: parseFloat(appointment.service.price as any) || 0,
          }
          : null,
      };

      res.status(200).json(appointmentWithNumberPrices);
    } catch (error) {
      console.error("Erro ao buscar agendamento:", error);

      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  }

  // Criar novo agendamento
  async create(req: Request, res: Response) {
    try {
      const {
        customerId,
        barberId,
        serviceIds,
        appointmentDate,
        startTime,
        notes,
      } = req.body;

      // Validações
      if (
        !customerId || !barberId || (!serviceIds || serviceIds.length === 0) ||
        !appointmentDate || !startTime
      ) {
        throw new BadRequestError(
          "Todos os campos obrigatórios devem ser preenchidos",
        );
      }

      // Verificar se customer existe
      const customer = await customerRepository.findOneBy({ id: customerId });
      if (!customer) {
        throw new NotFoundError("Cliente não encontrado");
      }

      // Verificar se barber existe
      const barber = await barberRepository.findOneBy({ id: barberId });
      if (!barber) {
        throw new NotFoundError("Barbeiro não encontrado");
      }

      // Verificar se os serviços existem e calcular preço total
      let totalPrice = 0;
      const services = [];
      for (const serviceId of serviceIds) {
        const service = await serviceRepository.findOneBy({ id: serviceId });
        if (!service) {
          throw new NotFoundError(`Serviço com ID ${serviceId} não encontrado`);
        }
        services.push(service);
        // Garantir que o preço seja convertido para número
        const servicePrice = typeof service.price === "string"
          ? parseFloat(service.price)
          : service.price;
        totalPrice += servicePrice;
      }

      // Criar data/hora completa
      const scheduledDateTime = new Date(`${appointmentDate}T${startTime}:00`);

      // Verificar se o horário está disponível
      const existingAppointment = await appointmentRepository.findOne({
        where: {
          barberId,
          scheduledDateTime,
          status: AppointmentStatus.SCHEDULED,
        },
      });

      if (existingAppointment) {
        throw new BadRequestError("Horário já ocupado para este barbeiro");
      }

      // Garantir que totalPrice seja um número válido
      const finalTotalPrice = Number(totalPrice);
      if (isNaN(finalTotalPrice)) {
        throw new BadRequestError("Erro no cálculo do preço total");
      }

      // Criar agendamentos para cada serviço (por enquanto só o primeiro serviço)
      // Futuramente pode ser expandido para múltiplos serviços em sequência
      const newAppointment = appointmentRepository.create({
        customerId,
        barberId,
        serviceId: serviceIds[0], // Por enquanto apenas um serviço
        scheduledDateTime,
        totalPrice: finalTotalPrice,
        notes: notes || null,
        status: AppointmentStatus.SCHEDULED,
      });

      const savedAppointment = await appointmentRepository.save(newAppointment);

      // Buscar o agendamento completo com relacionamentos
      const appointmentWithRelations = await appointmentRepository.findOne({
        where: { id: savedAppointment.id },
        relations: ["customer", "barber", "service"],
      });

      // Enviar notificação por email (não bloqueia a resposta)
      NotificationService.sendAppointmentConfirmation(appointmentWithRelations!)
        .then((result) => {
          if (!result.success) {
            console.warn("Falha ao enviar notificação:", result.error);
          }
        })
        .catch((error) => {
          console.error("Erro inesperado ao enviar notificação:", error);
        });

      res.status(201).json({
        message: "Agendamento criado com sucesso",
        appointment: appointmentWithRelations,
      });
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);

      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  }

  // Atualizar agendamento
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        customerId,
        barberId,
        serviceIds,
        appointmentDate,
        startTime,
        notes,
        status,
      } = req.body;

      const appointment = await appointmentRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["customer", "barber", "service"],
      });

      if (!appointment) {
        throw new NotFoundError("Agendamento não encontrado");
      }

      // Atualizar campos se fornecidos
      if (customerId && customerId !== appointment.customerId) {
        const customer = await customerRepository.findOneBy({ id: customerId });
        if (!customer) {
          throw new NotFoundError("Cliente não encontrado");
        }
        appointment.customerId = customerId;
      }

      if (barberId && barberId !== appointment.barberId) {
        const barber = await barberRepository.findOneBy({ id: barberId });
        if (!barber) {
          throw new NotFoundError("Barbeiro não encontrado");
        }
        appointment.barberId = barberId;
      }

      if (serviceIds && serviceIds.length > 0) {
        // Verificar se o serviço existe e atualizar preço
        const service = await serviceRepository.findOneBy({
          id: serviceIds[0],
        });
        if (!service) {
          throw new NotFoundError("Serviço não encontrado");
        }
        appointment.serviceId = serviceIds[0];
        // Garantir que o preço seja convertido para número
        const servicePrice = typeof service.price === "string"
          ? parseFloat(service.price)
          : service.price;
        appointment.totalPrice = Number(servicePrice);
      }

      // Se estiver mudando a data/hora, verificar disponibilidade
      if (appointmentDate && startTime) {
        const newScheduledDateTime = new Date(
          `${appointmentDate}T${startTime}:00`,
        );

        if (
          newScheduledDateTime.getTime() !==
            appointment.scheduledDateTime.getTime()
        ) {
          const existingAppointment = await appointmentRepository.findOne({
            where: {
              barberId: appointment.barberId,
              scheduledDateTime: newScheduledDateTime,
              status: AppointmentStatus.SCHEDULED,
            },
          });

          if (
            existingAppointment && existingAppointment.id !== appointment.id
          ) {
            throw new BadRequestError("Horário já ocupado para este barbeiro");
          }

          appointment.scheduledDateTime = newScheduledDateTime;
        }
      }

      if (notes !== undefined) {
        appointment.notes = notes;
      }

      if (status) {
        appointment.status = status;

        // Atualizar timestamps baseado no status
        if (
          status === AppointmentStatus.IN_PROGRESS && !appointment.startedAt
        ) {
          appointment.startedAt = new Date();
        } else if (
          status === AppointmentStatus.COMPLETED && !appointment.completedAt
        ) {
          appointment.completedAt = new Date();
        }
      }

      const updatedAppointment = await appointmentRepository.save(appointment);

      // Buscar o agendamento atualizado com relacionamentos
      const appointmentWithRelations = await appointmentRepository.findOne({
        where: { id: updatedAppointment.id },
        relations: ["customer", "barber", "service"],
      });

      res.status(200).json({
        message: "Agendamento atualizado com sucesso",
        appointment: appointmentWithRelations,
      });
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);

      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  }

  // Cancelar agendamento
  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const appointment = await appointmentRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["customer", "barber", "service"],
      });

      if (!appointment) {
        throw new NotFoundError("Agendamento não encontrado");
      }

      if (appointment.status === AppointmentStatus.COMPLETED) {
        throw new BadRequestError(
          "Não é possível cancelar um agendamento já concluído",
        );
      }

      appointment.status = AppointmentStatus.CANCELLED;
      const cancelledAppointment = await appointmentRepository.save(
        appointment,
      );

      // Enviar notificação de cancelamento por email (não bloqueia a resposta)
      NotificationService.sendAppointmentCancellation(appointment)
        .then((result) => {
          if (!result.success) {
            console.warn(
              "Falha ao enviar notificação de cancelamento:",
              result.error,
            );
          }
        })
        .catch((error) => {
          console.error(
            "Erro inesperado ao enviar notificação de cancelamento:",
            error,
          );
        });

      res.status(200).json({
        message: "Agendamento cancelado com sucesso",
        appointment: cancelledAppointment,
      });
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);

      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  }

  // Excluir agendamento
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const appointment = await appointmentRepository.findOneBy({
        id: parseInt(id),
      });

      if (!appointment) {
        throw new NotFoundError("Agendamento não encontrado");
      }

      await appointmentRepository.remove(appointment);

      res.status(200).json({ message: "Agendamento excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);

      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  }

  // Buscar agendamentos por data (para calendário)
  async getByDate(req: Request, res: Response) {
    try {
      const { date } = req.params;

      const appointments = await appointmentRepository
        .createQueryBuilder("appointment")
        .leftJoinAndSelect("appointment.customer", "customer")
        .leftJoinAndSelect("appointment.barber", "barber")
        .leftJoinAndSelect("appointment.service", "service")
        .where("DATE(appointment.scheduledDateTime) = :date", { date })
        .orderBy("appointment.scheduledDateTime", "ASC")
        .getMany();

      // Converter preços de string para número
      const appointmentsWithNumberPrices = appointments.map((appointment) => ({
        ...appointment,
        totalPrice: parseFloat(appointment.totalPrice as any) || 0,
        service: appointment.service
          ? {
            ...appointment.service,
            price: parseFloat(appointment.service.price as any) || 0,
          }
          : null,
      }));

      res.status(200).json(appointmentsWithNumberPrices);
    } catch (error) {
      console.error("Erro ao buscar agendamentos por data:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  // Buscar horários disponíveis para um barbeiro em uma data
  async getAvailableSlots(req: Request, res: Response) {
    try {
      const { barberId, date } = req.params;

      // Horário de funcionamento da barbearia (8h às 18h)
      const startHour = 8;
      const endHour = 18;
      // const slotDuration = 60; // 60 minutos por agendamento

      // Buscar agendamentos existentes para o barbeiro na data
      const existingAppointments = await appointmentRepository
        .createQueryBuilder("appointment")
        .where("appointment.barberId = :barberId", { barberId })
        .andWhere("DATE(appointment.scheduledDateTime) = :date", { date })
        .andWhere("appointment.status IN (:...statuses)", {
          statuses: [
            AppointmentStatus.SCHEDULED,
            AppointmentStatus.IN_PROGRESS,
          ],
        })
        .getMany();

      // Gerar todos os slots possíveis
      const allSlots = [];
      for (let hour = startHour; hour < endHour; hour++) {
        allSlots.push(`${hour.toString().padStart(2, "0")}:00`);
      }

      // Remover slots ocupados
      const occupiedSlots = existingAppointments.map((appointment) => {
        const time = new Date(appointment.scheduledDateTime);
        return `${time.getHours().toString().padStart(2, "0")}:${
          time.getMinutes().toString().padStart(2, "0")
        }`;
      });

      const availableSlots = allSlots.filter((slot) =>
        !occupiedSlots.includes(slot)
      );

      res.status(200).json({ availableSlots });
    } catch (error) {
      console.error("Erro ao buscar horários disponíveis:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  // Enviar lembrete de agendamento
  async sendReminder(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const appointment = await appointmentRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["customer", "barber", "service"],
      });

      if (!appointment) {
        throw new NotFoundError("Agendamento não encontrado");
      }

      if (appointment.status !== AppointmentStatus.SCHEDULED) {
        throw new BadRequestError(
          "Só é possível enviar lembrete para agendamentos confirmados",
        );
      }

      // Verificar se o agendamento é futuro
      const now = new Date();
      if (appointment.scheduledDateTime <= now) {
        throw new BadRequestError(
          "Não é possível enviar lembrete para agendamentos passados",
        );
      }

      // Enviar lembrete
      const result = await NotificationService.sendAppointmentReminder(
        appointment,
      );

      if (result.success) {
        res.status(200).json({
          message: "Lembrete enviado com sucesso",
          details: result,
        });
      } else {
        res.status(400).json({
          message: "Falha ao enviar lembrete",
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Erro ao enviar lembrete:", error);

      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  }

  // Verificar status das notificações
  async getNotificationStatus(_req: Request, res: Response) {
    try {
      const isEnabled = await NotificationService
        .areEmailNotificationsEnabled();

      res.status(200).json({
        emailNotificationsEnabled: isEnabled,
        message: isEnabled
          ? "Notificações por email estão ativas"
          : "Notificações por email não estão configuradas",
      });
    } catch (error) {
      console.error("Erro ao verificar status das notificações:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  // Gerenciar serviço de lembretes automáticos
  getReminderStatus(_req: Request, res: Response) {
    try {
      const status = ReminderService.getStatus();

      res.status(200).json({
        ...status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Erro ao verificar status de lembretes:", error);
      res.status(500).json({
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Executar teste de lembretes
  async testReminders(_req: Request, res: Response) {
    try {
      await ReminderService.runTestReminders();

      res.status(200).json({
        message: "Teste de lembretes executado com sucesso",
        note: "Verifique os logs do servidor para detalhes",
      });
    } catch (error) {
      console.error("Erro ao executar teste de lembretes:", error);
      res.status(500).json({
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Buscar agendamentos em formato para FullCalendar
  async getCalendarEvents(req: Request, res: Response) {
    try {
      const { start, end, barberId } = req.query;

      // Validar parâmetros obrigatórios
      if (!start || !end) {
        return res.status(400).json({
          message: "Parâmetros start e end são obrigatórios",
        });
      }

      let query = appointmentRepository
        .createQueryBuilder("appointment")
        .leftJoinAndSelect("appointment.customer", "customer")
        .leftJoinAndSelect("appointment.barber", "barber")
        .leftJoinAndSelect("appointment.service", "service")
        .where("appointment.scheduledDateTime >= :start", { start })
        .andWhere("appointment.scheduledDateTime <= :end", { end });

      if (barberId) {
        query = query.andWhere("appointment.barberId = :barberId", {
          barberId,
        });
      }

      const appointments = await query.getMany();

      // Converter para formato do FullCalendar
      const events = appointments.map((appointment) => {
        const serviceDuration = appointment.service?.duration || 60; // default 60 minutos
        const endTime = new Date(
          appointment.scheduledDateTime.getTime() + serviceDuration * 60000,
        );

        return {
          id: appointment.id.toString(),
          title: `${appointment.customer?.name || "Cliente"} - ${
            appointment.service?.name || "Serviço"
          }`,
          start: appointment.scheduledDateTime,
          end: endTime,
          backgroundColor: this.getStatusColor(appointment.status),
          borderColor: this.getStatusColor(appointment.status),
          classNames: [`status-${appointment.status}`, "calendar-event"],
          extendedProps: {
            customerId: appointment.customerId,
            barberId: appointment.barberId,
            serviceId: appointment.serviceId,
            status: appointment.status,
            notes: appointment.notes,
            totalPrice: parseFloat(appointment.totalPrice as any) || 0,
            customerName: appointment.customer?.name,
            barberName: appointment.barber?.name,
            serviceName: appointment.service?.name,
            customerPhone: appointment.customer?.phone,
            recurrenceType: appointment.recurrenceType,
            duration: serviceDuration,
          },
        };
      });

      res.status(200).json(events);
    } catch (error) {
      console.error("Erro ao buscar eventos do calendário:", error);
      res.status(500).json({
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Mover agendamento (drag & drop)
  async moveAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newDateTime, barberId } = req.body;

      const appointment = await appointmentRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["customer", "barber", "service"],
      });

      if (!appointment) {
        throw new NotFoundError("Agendamento não encontrado");
      }

      const newScheduledDateTime = new Date(newDateTime);

      // Validar horário de funcionamento (8h às 18h)
      const hour = newScheduledDateTime.getHours();
      if (hour < 8 || hour >= 18) {
        throw new BadRequestError(
          "Horário fora do funcionamento da barbearia (8h às 18h)",
        );
      }

      // Verificar se o novo horário está disponível
      const conflictingAppointment = await appointmentRepository.findOne({
        where: {
          barberId: barberId || appointment.barberId,
          scheduledDateTime: newScheduledDateTime,
          status: AppointmentStatus.SCHEDULED,
        },
      });

      if (
        conflictingAppointment && conflictingAppointment.id !== appointment.id
      ) {
        throw new BadRequestError("Horário já ocupado");
      }

      // Atualizar agendamento
      appointment.scheduledDateTime = newScheduledDateTime;
      if (barberId && barberId !== appointment.barberId) {
        // Verificar se o barbeiro existe
        const barber = await barberRepository.findOneBy({ id: barberId });
        if (!barber) {
          throw new NotFoundError("Barbeiro não encontrado");
        }
        appointment.barberId = barberId;
      }

      const updatedAppointment = await appointmentRepository.save(appointment);

      res.status(200).json({
        message: "Agendamento movido com sucesso",
        appointment: updatedAppointment,
      });
    } catch (error) {
      console.error("Erro ao mover agendamento:", error);

      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  }

  // Criar agendamento recorrente
  async createRecurringAppointment(req: Request, res: Response) {
    try {
      const {
        customerId,
        barberId,
        serviceIds,
        appointmentDate,
        startTime,
        notes,
        recurrenceType,
        recurrenceEndDate,
        recurrenceCount = 10, // máximo de 10 repetições
      } = req.body;

      // Validações básicas
      if (
        !customerId || !barberId || (!serviceIds || serviceIds.length === 0) ||
        !appointmentDate || !startTime || !recurrenceType
      ) {
        throw new BadRequestError(
          "Todos os campos obrigatórios devem ser preenchidos",
        );
      }

      // Verificar se entities existem
      const customer = await customerRepository.findOneBy({ id: customerId });
      if (!customer) {
        throw new NotFoundError("Cliente não encontrado");
      }

      const barber = await barberRepository.findOneBy({ id: barberId });
      if (!barber) {
        throw new NotFoundError("Barbeiro não encontrado");
      }

      const service = await serviceRepository.findOneBy({ id: serviceIds[0] });
      if (!service) {
        throw new NotFoundError("Serviço não encontrado");
      }

      const servicePrice = typeof service.price === "string"
        ? parseFloat(service.price)
        : service.price;
      const firstDateTime = new Date(`${appointmentDate}T${startTime}:00`);
      const endDate = recurrenceEndDate ? new Date(recurrenceEndDate) : null;

      // Criar agendamento pai
      const parentAppointment = appointmentRepository.create({
        customerId,
        barberId,
        serviceId: serviceIds[0],
        scheduledDateTime: firstDateTime,
        totalPrice: Number(servicePrice),
        notes: notes || null,
        status: AppointmentStatus.SCHEDULED,
        recurrenceType,
        recurrenceEndDate: endDate || undefined,
        isRecurringParent: true,
      });

      const savedParent = await appointmentRepository.save(parentAppointment);

      // Criar agendamentos filhos baseado na recorrência
      const childAppointments = [];
      const currentDate = new Date(firstDateTime);
      let count = 0;

      while (count < recurrenceCount && (!endDate || currentDate <= endDate)) {
        // Pular a primeira data (já criada como pai)
        if (count > 0) {
          // Verificar se não há conflito
          const existingAppointment = await appointmentRepository.findOne({
            where: {
              barberId,
              scheduledDateTime: currentDate,
              status: AppointmentStatus.SCHEDULED,
            },
          });

          if (!existingAppointment) {
            const childAppointment = appointmentRepository.create({
              customerId,
              barberId,
              serviceId: serviceIds[0],
              scheduledDateTime: new Date(currentDate),
              totalPrice: Number(servicePrice),
              notes: notes || null,
              status: AppointmentStatus.SCHEDULED,
              recurrenceType,
              parentAppointmentId: (savedParent as any).id,
              isRecurringParent: false,
            });

            childAppointments.push(childAppointment);
          }
        }

        // Calcular próxima data baseada no tipo de recorrência
        switch (recurrenceType) {
          case "weekly":
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case "biweekly":
            currentDate.setDate(currentDate.getDate() + 14);
            break;
          case "monthly":
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          default:
            count = recurrenceCount; // Para parar o loop
        }
        count++;
      }

      // Salvar agendamentos filhos
      if (childAppointments.length > 0) {
        await appointmentRepository.save(childAppointments);
      }

      res.status(201).json({
        message: "Agendamentos recorrentes criados com sucesso",
        parentAppointment: savedParent,
        childrenCount: childAppointments.length,
      });
    } catch (error) {
      console.error("Erro ao criar agendamentos recorrentes:", error);

      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  }

  // Método auxiliar para cores do status
  private getStatusColor(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return "#1976d2"; // Azul
      case AppointmentStatus.IN_PROGRESS:
        return "#388e3c"; // Verde
      case AppointmentStatus.COMPLETED:
        return "#616161"; // Cinza
      case AppointmentStatus.CANCELLED:
        return "#d32f2f"; // Vermelho
      default:
        return "#1976d2";
    }
  }
}
