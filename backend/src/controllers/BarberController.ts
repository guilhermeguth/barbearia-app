import { Request, Response } from "express";
import { barberRepository } from "../repositories/barberRepository";
import { userRepository } from "../repositories/userRepository";
import { BadRequestError, NotFoundError } from "../helpers/api-errors";
import { UserRole } from "../entities/User";
import { deleteBarberPhoto, getBarberPhotoUrl } from "../middlewares/uploadMiddleware";
import bcrypt from "bcrypt";

export class BarberController {
  async persist(req: Request, res: Response) {
    const post = req.body;
    const uploadedFile = req.file; // Arquivo enviado via multer

    let barber = post?.id
      ? await barberRepository.findOne({
        where: { id: post.id },
        relations: ["user"],
      })
      : null;

    if (!post?.name || !post?.email || !post?.phone) {
      throw new BadRequestError("Nome, email e telefone são obrigatórios");
    }

    let photoPath: string | null = null;

    // Se um novo arquivo foi enviado
    if (uploadedFile) {
      photoPath = uploadedFile.filename; // Apenas o nome do arquivo
      
      // Se estamos editando e há uma foto antiga, deletar
      if (barber?.photoUrl) {
        deleteBarberPhoto(barber.photoUrl);
      }
    } else if (barber?.photoUrl) {
      // Mantém a foto existente se não enviou nova
      photoPath = barber.photoUrl;
    }

    if (!barber) {
      // Criar novo barbeiro - precisa criar usuário também
      if (!post?.password) {
        throw new BadRequestError("Senha é obrigatória para novo barbeiro");
      }

      // Verificar se já existe usuário com este email
      const existingUser = await userRepository.findOneBy({
        email: post.email,
      });
      if (existingUser) {
        throw new BadRequestError("Já existe um usuário com este email");
      }

      // Criar usuário admin
      const hashedPassword = await bcrypt.hash(post.password, 10);
      const user = userRepository.create({
        name: post.name,
        email: post.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
        createdAt: new Date(),
      });

      const savedUser = await userRepository.save(user);

      // Criar barbeiro
      barber = barberRepository.create({
        name: post.name,
        email: post.email,
        phone: post.phone,
        photoUrl: photoPath || undefined,
        user: savedUser,
        userId: savedUser.id,
        createdAt: new Date(),
      });
    } else {
      // Atualizar barbeiro existente
      barber.name = post.name;
      barber.phone = post.phone;
      if (photoPath !== null) {
        barber.photoUrl = photoPath;
      }

      // Atualizar também o usuário
      if (barber.user) {
        barber.user.name = post.name;
        await userRepository.save(barber.user);
      }
    }

    await barberRepository.save(barber);

    const action = post?.id ? "atualizado" : "cadastrado";

    res.status(201).json({
      message: `Barbeiro ${action} com sucesso`,
      barber: {
        id: barber.id,
        name: barber.name,
        email: barber.email,
        phone: barber.phone,
        createdAt: barber.createdAt,
      },
    });
  }

  async getAll(req: Request, res: Response) {
    const barbers = await barberRepository.find({
      relations: ["user"],
      order: { name: "ASC" },
    });

    // Não retornar dados sensíveis do usuário
    const barbearsResponse = barbers.map((barber) => ({
      id: barber.id,
      name: barber.name,
      email: barber.email,
      phone: barber.phone,
      photoUrl: getBarberPhotoUrl(barber.photoUrl, req),
      createdAt: barber.createdAt,
      userId: barber.userId,
    }));

    res.status(200).json(barbearsResponse);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const barber = await barberRepository.findOne({
      where: { id: Number(id) },
      relations: ["user"],
    });

    if (!barber) {
      throw new NotFoundError("Barbeiro não encontrado");
    }

    // Remover foto se existir
    if (barber.photoUrl) {
      deleteBarberPhoto(barber.photoUrl);
    }

    // Remover barbeiro (o usuário permanece no sistema)
    await barberRepository.remove(barber);

    res.status(200).json({
      message: "Barbeiro excluído com sucesso",
    });
  }

  async getWorkingHours(req: Request, res: Response) {
    const { id } = req.params;

    const barber = await barberRepository.findOneBy({ id: Number(id) });

    if (!barber) {
      throw new NotFoundError("Barbeiro não encontrado");
    }

    // Se não tem horários definidos, retorna template padrão
    const defaultWorkingHours = {
      monday: { enabled: false, startTime: "08:00", endTime: "18:00" },
      tuesday: { enabled: false, startTime: "08:00", endTime: "18:00" },
      wednesday: { enabled: false, startTime: "08:00", endTime: "18:00" },
      thursday: { enabled: false, startTime: "08:00", endTime: "18:00" },
      friday: { enabled: false, startTime: "08:00", endTime: "18:00" },
      saturday: { enabled: false, startTime: "08:00", endTime: "18:00" },
      sunday: { enabled: false, startTime: "08:00", endTime: "18:00" },
    };

    res.status(200).json({
      workingHours: barber.workingHours || defaultWorkingHours,
    });
  }

  async updateWorkingHours(req: Request, res: Response) {
    const { id } = req.params;
    const { workingHours } = req.body;

    const barber = await barberRepository.findOneBy({ id: Number(id) });

    if (!barber) {
      throw new NotFoundError("Barbeiro não encontrado");
    }

    // Validar estrutura dos horários
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    if (!workingHours || typeof workingHours !== 'object') {
      throw new BadRequestError("Horários de trabalho são obrigatórios");
    }

    // Validar cada dia da semana
    for (const day of validDays) {
      if (workingHours[day]) {
        const dayConfig = workingHours[day];
        
        if (typeof dayConfig.enabled !== 'boolean') {
          throw new BadRequestError(`Campo 'enabled' inválido para ${day}`);
        }

        if (dayConfig.enabled) {
          if (!dayConfig.startTime || !dayConfig.endTime) {
            throw new BadRequestError(`Horário de início e fim são obrigatórios para ${day}`);
          }

          // Validar formato de horário (HH:MM)
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(dayConfig.startTime) || !timeRegex.test(dayConfig.endTime)) {
            throw new BadRequestError(`Formato de horário inválido para ${day}. Use HH:MM`);
          }

          // Validar que horário de fim é após o de início
          const startMinutes = this.timeToMinutes(dayConfig.startTime);
          const endMinutes = this.timeToMinutes(dayConfig.endTime);
          
          if (endMinutes <= startMinutes) {
            throw new BadRequestError(`Horário de fim deve ser posterior ao de início para ${day}`);
          }

          // Validar intervalo se fornecido
          if (dayConfig.breakStart && dayConfig.breakEnd) {
            if (!timeRegex.test(dayConfig.breakStart) || !timeRegex.test(dayConfig.breakEnd)) {
              throw new BadRequestError(`Formato de horário de intervalo inválido para ${day}. Use HH:MM`);
            }

            const breakStartMinutes = this.timeToMinutes(dayConfig.breakStart);
            const breakEndMinutes = this.timeToMinutes(dayConfig.breakEnd);

            if (breakEndMinutes <= breakStartMinutes) {
              throw new BadRequestError(`Horário de fim do intervalo deve ser posterior ao de início para ${day}`);
            }

            if (breakStartMinutes < startMinutes || breakEndMinutes > endMinutes) {
              throw new BadRequestError(`Intervalo deve estar dentro do horário de trabalho para ${day}`);
            }
          }
        }
      }
    }

    barber.workingHours = workingHours;
    await barberRepository.save(barber);

    res.status(200).json({
      message: "Horários de trabalho atualizados com sucesso",
      workingHours: barber.workingHours,
    });
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
