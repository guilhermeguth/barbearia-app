import { Request, Response } from "express";
import { appointmentRepository } from "../repositories/appointmentRepository";
import { customerRepository } from "../repositories/customerRepository";
import { barberRepository } from "../repositories/barberRepository";
import { serviceRepository } from "../repositories/serviceRepository";
import { userRepository } from "../repositories/userRepository";
import { BadRequestError, NotFoundError } from "../helpers/api-errors";
import { AppointmentStatus } from "../entities/Appointment";
import { UserRole } from "../entities/User";
import { NotificationService } from "../services/notificationService";

export class CustomerAppointmentController {
  // Buscar barbeiros disponíveis para o cliente
  async getAvailableBarbers(_req: Request, res: Response) {
    try {
      const barbers = await barberRepository.find({
        select: ["id", "name", "workingHours", "photoUrl"],
      });

      res.status(200).json(barbers);
    } catch (error) {
      console.error("Erro ao buscar barbeiros:", error);
      res.status(500).json({
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Buscar serviços disponíveis
  async getAvailableServices(_req: Request, res: Response) {
    try {
      const services = await serviceRepository.find({
        select: ["id", "name", "price", "duration"],
        order: { name: "ASC" },
      });

      // Converter preços para número
      const servicesWithNumberPrices = services.map((service) => ({
        ...service,
        price: parseFloat(service.price as any) || 0,
      }));

      res.status(200).json(servicesWithNumberPrices);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      res.status(500).json({
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Buscar horários disponíveis para um barbeiro em uma data (versão simplificada para cliente)
  async getAvailableSlots(req: Request, res: Response) {
    try {
      const { barberId, date, serviceDuration } = req.params;
      const { serviceId } = req.query;

      let duration = parseInt(serviceDuration) || null;

      // Se não foi passada duração mas foi passado serviceId, buscar a duração do serviço
      if (!duration && serviceId) {
        const service = await serviceRepository.findOneBy({
          id: parseInt(serviceId as string),
        });
        if (!service) {
          return res.status(404).json({
            message: "Serviço não encontrado",
          });
        }
        duration = service.duration || 60;
      }

      // Se ainda não temos duração, usar padrão
      if (!duration) {
        duration = 60;
      }

      // Buscar o barbeiro e seus horários de trabalho
      const barber = await barberRepository.findOne({
        where: { id: parseInt(barberId) },
      });

      if (!barber) {
        return res.status(404).json({
          message: "Barbeiro não encontrado",
        });
      }

      // Determinar o dia da semana da data solicitada
      const requestDate = new Date(date + "T00:00:00");
      const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const dayOfWeek = dayNames[requestDate.getDay()];

      // Verificar se o barbeiro trabalha no dia solicitado
      const dayConfig = barber.workingHours?.[dayOfWeek];
      if (!dayConfig || !dayConfig.enabled) {
        return res.status(200).json({
          availableSlots: [],
          message: "Barbeiro não trabalha neste dia",
        });
      }

      // Gerar slots disponíveis (lógica similar ao admin, mas simplificada)
      const startHour = parseInt(dayConfig.startTime.split(":")[0]);
      const startMinute = parseInt(dayConfig.startTime.split(":")[1]);
      const endHour = parseInt(dayConfig.endTime.split(":")[0]);
      const endMinute = parseInt(dayConfig.endTime.split(":")[1]);

      // Buscar agendamentos existentes
      const existingAppointments = await appointmentRepository
        .createQueryBuilder("appointment")
        .leftJoinAndSelect("appointment.service", "service")
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
      let currentMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      while (currentMinutes < endMinutes) {
        const hour = Math.floor(currentMinutes / 60);
        const minute = currentMinutes % 60;
        const slotString = `${hour.toString().padStart(2, "0")}:${
          minute.toString().padStart(2, "0")
        }`;

        const serviceEndMinutes = currentMinutes + duration;

        if (serviceEndMinutes <= endMinutes) {
          // Verificar intervalo
          let isInBreak = false;
          if (dayConfig.breakStart && dayConfig.breakEnd) {
            const breakStartMinutes =
              parseInt(dayConfig.breakStart.split(":")[0]) * 60 +
              parseInt(dayConfig.breakStart.split(":")[1]);
            const breakEndMinutes =
              parseInt(dayConfig.breakEnd.split(":")[0]) * 60 +
              parseInt(dayConfig.breakEnd.split(":")[1]);

            if (
              (currentMinutes >= breakStartMinutes &&
                currentMinutes < breakEndMinutes) ||
              (serviceEndMinutes > breakStartMinutes &&
                serviceEndMinutes <= breakEndMinutes) ||
              (currentMinutes < breakStartMinutes &&
                serviceEndMinutes > breakEndMinutes)
            ) {
              isInBreak = true;
            }
          }

          if (!isInBreak) {
            allSlots.push(slotString);
          }
        }

        currentMinutes += 30;
      }

      // Calcular slots ocupados
      const occupiedSlots = new Set();
      existingAppointments.forEach((appointment) => {
        const startTime = new Date(appointment.scheduledDateTime);
        const appointmentDuration = appointment.service?.duration || 60;
        const slotsNeeded = Math.ceil(appointmentDuration / 30);

        for (let i = 0; i < slotsNeeded; i++) {
          const slotTime = new Date(startTime.getTime() + (i * 30 * 60 * 1000));
          const slotString = `${
            slotTime.getHours().toString().padStart(2, "0")
          }:${slotTime.getMinutes().toString().padStart(2, "0")}`;
          occupiedSlots.add(slotString);
        }
      });

      // Filtrar slots disponíveis
      const availableSlots = allSlots.filter((slot) => {
        if (occupiedSlots.has(slot)) return false;

        const [hour, minute] = slot.split(":").map(Number);
        const slotMinutes = hour * 60 + minute;
        const slotsNeeded = Math.ceil(duration / 30);

        for (let i = 0; i < slotsNeeded; i++) {
          const checkMinutes = slotMinutes + (i * 30);
          const checkHour = Math.floor(checkMinutes / 60);
          const checkMinute = checkMinutes % 60;
          const checkSlot = `${checkHour.toString().padStart(2, "0")}:${
            checkMinute.toString().padStart(2, "0")
          }`;

          if (occupiedSlots.has(checkSlot)) return false;
        }

        return true;
      });

      // Buscar informações do serviço se serviceId foi fornecido
      let serviceInfo = null;
      if (serviceId) {
        const service = await serviceRepository.findOneBy({
          id: parseInt(serviceId as string),
        });
        if (service) {
          serviceInfo = {
            name: service.name,
            duration: service.duration,
            price: parseFloat(service.price as any) || 0,
          };
        }
      }

      res.status(200).json({
        availableSlots,
        service: serviceInfo,
        barber: {
          name: barber.name,
        },
      });
    } catch (error) {
      console.error("Erro ao buscar horários disponíveis:", error);
      res.status(500).json({
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Criar agendamento (versão para cliente)
  async createAppointment(req: Request, res: Response) {
    try {
      // Log completo dos dados recebidos
      console.log("=== DADOS RECEBIDOS PARA AGENDAMENTO ===");
      console.log("req.body:", JSON.stringify(req.body, null, 2));
      console.log("req.user:", {
        id: req.user?.id,
        role: req.user?.role,
        name: req.user?.name,
      });

      const {
        barberId,
        serviceId,
        appointmentDate,
        startTime,
        notes,
      } = req.body;

      // Log dos campos extraídos
      console.log("Campos extraídos:");
      console.log("- barberId:", barberId, typeof barberId);
      console.log("- serviceId:", serviceId, typeof serviceId);
      console.log(
        "- appointmentDate:",
        appointmentDate,
        typeof appointmentDate,
      );
      console.log("- startTime:", startTime, typeof startTime);
      console.log("- notes:", notes, typeof notes);

      // Verificar se o usuário tem role de customer ou admin
      if (
        req.user?.role !== UserRole.CUSTOMER &&
        req.user?.role !== UserRole.ADMIN
      ) {
        throw new BadRequestError(
          "Apenas clientes podem criar agendamentos através desta API",
        );
      }

      let customerId: number;

      if (req.user.role === UserRole.ADMIN) {
        // Para admin, criar um customer ou usar o existente
        let customer = await customerRepository.findOne({
          where: { userId: req.user.id },
        });

        if (!customer) {
          // Criar um customer para o admin
          const customerData = {
            userId: req.user.id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone || undefined,
            birthDate: null,
            notes: "Cliente admin - teste",
          };
          customer = await customerRepository.save(customerData);
        }

        if (!customer) {
          throw new BadRequestError(
            "Erro ao criar perfil temporário para admin",
          );
        }

        customerId = customer.id;
      } else {
        // Buscar o customer associado ao usuário logado
        const customer = await customerRepository.findOne({
          where: { userId: req.user.id },
        });

        if (!customer) {
          throw new BadRequestError(
            "Usuário não possui perfil de cliente. Entre em contato com a barbearia.",
          );
        }
        customerId = customer.id;
      }

      // Validações
      if (!barberId || !serviceId || !appointmentDate || !startTime) {
        throw new BadRequestError(
          "Todos os campos obrigatórios devem ser preenchidos",
        );
      }

      // Verificar se barber existe
      const barber = await barberRepository.findOneBy({
        id: barberId,
      });
      if (!barber) {
        throw new NotFoundError("Barbeiro não encontrado");
      }

      // Verificar se o serviço existe
      const service = await serviceRepository.findOneBy({
        id: serviceId,
      });
      if (!service) {
        throw new NotFoundError("Serviço não encontrado");
      }

      // Converter data para formato ISO se necessário
      const formattedDate = appointmentDate.replace(/\//g, "-"); // 2025/07/02 -> 2025-07-02

      // Criar data/hora completa
      const scheduledDateTime = new Date(`${formattedDate}T${startTime}:00`);

      console.log("Data formatada:", formattedDate);
      console.log("DateTime criado:", scheduledDateTime);
      console.log("DateTime ISO:", scheduledDateTime.toISOString());

      // Verificar se a data é válida
      if (isNaN(scheduledDateTime.getTime())) {
        throw new BadRequestError(
          `Data/hora inválida: ${appointmentDate} ${startTime}`,
        );
      }

      // Verificar se é uma data futura
      const now = new Date();
      if (scheduledDateTime <= now) {
        throw new BadRequestError("Não é possível agendar para datas passadas");
      }

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

      const servicePrice = typeof service.price === "string"
        ? parseFloat(service.price)
        : service.price;

      // Criar agendamento
      const newAppointment = appointmentRepository.create({
        customerId,
        barberId,
        serviceId,
        scheduledDateTime,
        totalPrice: Number(servicePrice),
        notes: notes || null,
        status: AppointmentStatus.SCHEDULED,
      });

      const savedAppointment = await appointmentRepository.save(newAppointment);

      // Buscar o agendamento completo com relacionamentos
      const appointmentWithRelations = await appointmentRepository.findOne({
        where: { id: savedAppointment.id },
        relations: ["customer", "barber", "service"],
      });

      // Enviar notificação por email
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
        appointment: {
          id: appointmentWithRelations!.id,
          scheduledDateTime: appointmentWithRelations!.scheduledDateTime,
          totalPrice: parseFloat(appointmentWithRelations!.totalPrice as any) ||
            0,
          notes: appointmentWithRelations!.notes,
          status: appointmentWithRelations!.status,
          barber: {
            id: appointmentWithRelations!.barber?.id,
            name: appointmentWithRelations!.barber?.name,
          },
          service: {
            id: appointmentWithRelations!.service?.id,
            name: appointmentWithRelations!.service?.name,
            duration: appointmentWithRelations!.service?.duration,
            price:
              parseFloat(appointmentWithRelations!.service?.price as any) || 0,
          },
        },
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

  // Buscar agendamentos do cliente autenticado
  async getMyAppointments(req: Request, res: Response) {
    try {
      let customerId: number;

      // Se for admin usando o PWA, permitir acesso
      if (req.user?.role === UserRole.ADMIN) {
        // Buscar ou criar customer baseado no usuário atual
        let customer = await customerRepository.findOne({
          where: { userId: req.user.id },
        });

        if (!customer) {
          // Criar customer baseado no usuário admin para permitir testes
          customer = customerRepository.create({
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone || "",
            userId: req.user.id,
          });
          await customerRepository.save(customer);
        }
        customerId = customer.id;
      } else if (req.user?.role === UserRole.CUSTOMER) {
        // Buscar o customer associado ao usuário logado
        const customer = await customerRepository.findOne({
          where: { userId: req.user.id },
        });

        if (!customer) {
          throw new BadRequestError("Usuário não possui perfil de cliente");
        }
        customerId = customer.id;
      } else {
        throw new BadRequestError(
          "Apenas clientes podem acessar esta funcionalidade",
        );
      }

      const appointments = await appointmentRepository.find({
        where: { customerId },
        relations: ["barber", "service"],
        order: { scheduledDateTime: "DESC" },
      });

      // Converter preços para número e formatar resposta
      const formattedAppointments = appointments.map((appointment) => ({
        id: appointment.id,
        scheduledDateTime: appointment.scheduledDateTime,
        totalPrice: parseFloat(appointment.totalPrice as any) || 0,
        notes: appointment.notes,
        status: appointment.status,
        barber: {
          id: appointment.barber?.id,
          name: appointment.barber?.name,
        },
        service: {
          id: appointment.service?.id,
          name: appointment.service?.name,
          duration: appointment.service?.duration,
          price: parseFloat(appointment.service?.price as any) || 0,
        },
      }));

      res.status(200).json(formattedAppointments);
    } catch (error) {
      console.error("Erro ao buscar agendamentos do cliente:", error);

      if (error instanceof BadRequestError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  }

  // Cancelar agendamento do cliente
  async cancelMyAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verificar se o usuário tem role de customer ou admin
      if (
        req.user?.role !== UserRole.CUSTOMER &&
        req.user?.role !== UserRole.ADMIN
      ) {
        throw new BadRequestError(
          "Apenas clientes podem cancelar agendamentos através desta API",
        );
      }

      let customerId: number;

      if (req.user?.role === UserRole.ADMIN) {
        // Para admin, buscar customer associado
        const customer = await customerRepository.findOne({
          where: { userId: req.user.id },
        });

        if (!customer) {
          throw new BadRequestError("Admin não possui perfil de cliente");
        }
        customerId = customer.id;
      } else {
        // Buscar o customer associado ao usuário logado
        const customer = await customerRepository.findOne({
          where: { userId: req.user.id },
        });

        if (!customer) {
          throw new BadRequestError("Usuário não possui perfil de cliente");
        }
        customerId = customer.id;
      }

      const appointment = await appointmentRepository.findOne({
        where: {
          id: parseInt(id),
          customerId, // Garantir que o cliente só pode cancelar seus próprios agendamentos
        },
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

      if (appointment.status === AppointmentStatus.CANCELLED) {
        throw new BadRequestError("Agendamento já foi cancelado");
      }

      // Verificar se pode cancelar (ex: só até 2 horas antes)
      const now = new Date();
      const appointmentTime = new Date(appointment.scheduledDateTime);
      const hoursUntilAppointment =
        (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilAppointment < 2) {
        throw new BadRequestError(
          "Não é possível cancelar agendamentos com menos de 2 horas de antecedência",
        );
      }

      appointment.status = AppointmentStatus.CANCELLED;
      const cancelledAppointment = await appointmentRepository.save(
        appointment,
      );

      // Enviar notificação de cancelamento
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
        appointment: {
          id: cancelledAppointment.id,
          status: cancelledAppointment.status,
        },
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

  // ======= MÉTODOS DE PERFIL =======

  // Buscar perfil do cliente
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const customer = await customerRepository.findOne({
        where: { userId },
        relations: ["user"],
      });

      if (!customer) {
        throw new NotFoundError("Cliente não encontrado");
      }

      const user = customer.user;

      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        photo: user.photoUrl,
        emailNotifications: user.emailNotifications ?? true,
        smsNotifications: user.smsNotifications ?? false,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);

      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  }

  // Atualizar perfil do cliente
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const {
        name,
        phone,
        currentPassword,
        newPassword,
        emailNotifications,
        smsNotifications,
      } = req.body;

      const customer = await customerRepository.findOne({
        where: { userId },
        relations: ["user"],
      });

      if (!customer || !customer.user) {
        throw new NotFoundError("Cliente não encontrado");
      }

      const user = customer.user;

      // Validações
      if (!name || name.trim().length < 2) {
        throw new BadRequestError("Nome deve ter pelo menos 2 caracteres");
      }

      // Se nova senha foi fornecida, verificar senha atual
      if (newPassword) {
        if (!currentPassword) {
          throw new BadRequestError(
            "Senha atual é obrigatória para alterar a senha",
          );
        }

        const bcrypt = require("bcryptjs");
        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          user.password,
        );

        if (!isCurrentPasswordValid) {
          throw new BadRequestError("Senha atual incorreta");
        }

        if (newPassword.length < 6) {
          throw new BadRequestError(
            "Nova senha deve ter pelo menos 6 caracteres",
          );
        }

        // Hash da nova senha
        const saltRounds = 10;
        user.password = await bcrypt.hash(newPassword, saltRounds);
      }

      // Atualizar dados
      user.name = name.trim();
      user.phone = phone?.trim() || null;
      user.emailNotifications = emailNotifications ?? true;
      user.smsNotifications = smsNotifications ?? false;

      // Usar repository para salvar
      await userRepository.save(user);

      res.status(200).json({
        message: "Perfil atualizado com sucesso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          photo: user.photoUrl,
          emailNotifications: user.emailNotifications,
          smsNotifications: user.smsNotifications,
        },
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);

      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  }

  // Atualizar foto do perfil
  async updateProfilePhoto(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const file = req.file;

      if (!file) {
        throw new BadRequestError("Nenhuma foto foi enviada");
      }

      const customer = await customerRepository.findOne({
        where: { userId },
        relations: ["user"],
      });

      if (!customer || !customer.user) {
        throw new NotFoundError("Cliente não encontrado");
      }

      const user = customer.user;

      // Deletar foto anterior se existir
      if (user.photoUrl) {
        const { deleteUserPhoto } = require("../middlewares/uploadMiddleware");
        deleteUserPhoto(user.photoUrl);
      }

      // Atualizar com o nome do novo arquivo
      user.photoUrl = file.filename;

      // Usar repository para salvar
      await userRepository.save(user);

      res.status(200).json({
        message: "Foto atualizada com sucesso",
        photo: user.photoUrl,
      });
    } catch (error) {
      console.error("Erro ao atualizar foto:", error);

      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  }

  // Excluir conta do cliente
  async deleteProfile(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const customer = await customerRepository.findOne({
        where: { userId },
        relations: ["user", "appointments"],
      });

      if (!customer || !customer.user) {
        throw new NotFoundError("Cliente não encontrado");
      }

      const user = customer.user;

      // Verificar se há agendamentos pendentes
      const hasActiveAppointments = customer.appointments?.some(
        (apt) =>
          apt.status === AppointmentStatus.SCHEDULED &&
          new Date(apt.scheduledDateTime) > new Date(),
      );

      if (hasActiveAppointments) {
        throw new BadRequestError(
          "Não é possível excluir conta com agendamentos pendentes. Cancele todos os agendamentos primeiro.",
        );
      }

      // Deletar foto se existir
      if (user.photoUrl) {
        const { deleteUserPhoto } = require("../middlewares/uploadMiddleware");
        deleteUserPhoto(user.photoUrl);
      }

      // Cancelar agendamentos futuros
      if (customer.appointments) {
        for (const appointment of customer.appointments) {
          if (appointment.status === AppointmentStatus.SCHEDULED) {
            appointment.status = AppointmentStatus.CANCELLED;
            await appointmentRepository.save(appointment);
          }
        }
      }

      // Remover customer (isso vai remover o user em cascata)
      await customerRepository.remove(customer);

      res.status(200).json({
        message: "Conta excluída com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir conta:", error);

      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  }
}
