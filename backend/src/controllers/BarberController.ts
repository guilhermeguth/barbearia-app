import { Request, Response } from "express";
import { barberRepository } from "../repositories/barberRepository";
import { userRepository } from "../repositories/userRepository";
import { BadRequestError, NotFoundError } from "../helpers/api-errors";
import { UserRole } from "../entities/User";
import bcrypt from "bcrypt";

export class BarberController {
  async persist(req: Request, res: Response) {
    const post = req.body;

    let barber = post?.id
      ? await barberRepository.findOne({
        where: { id: post.id },
        relations: ["user"],
      })
      : null;

    if (!post?.name || !post?.email || !post?.phone) {
      throw new BadRequestError("Nome, email e telefone são obrigatórios");
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
        user: savedUser,
        userId: savedUser.id,
        createdAt: new Date(),
      });
    } else {
      // Atualizar barbeiro existente
      barber.name = post.name;
      barber.phone = post.phone;

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

  async getAll(_req: Request, res: Response) {
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

    // Remover barbeiro (o usuário permanece no sistema)
    await barberRepository.remove(barber);

    res.status(200).json({
      message: "Barbeiro excluído com sucesso",
    });
  }
}
