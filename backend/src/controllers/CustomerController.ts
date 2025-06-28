import { Request, Response } from "express";
import { customerRepository } from "../repositories/customerRepository";
import { userRepository } from "../repositories/userRepository";
import { BadRequestError, NotFoundError } from "../helpers/api-errors";
import { UserRole } from "../entities/User";
import bcrypt from "bcrypt";

export class CustomerController {
  async persist(req: Request, res: Response) {
    const data = req.body;

    let customer = data?.id
      ? await customerRepository.findOne({
        where: { id: data.id },
        relations: ["user"],
      })
      : null;

    if (!customer) {
      customer = customerRepository.create({
        createdAt: new Date(),
      });
    }

    if (!data?.name) {
      throw new BadRequestError("Nome é obrigatório");
    }

    customer.name = data.name;
    customer.email = data.email;
    customer.phone = data.phone;
    customer.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    customer.notes = data.notes;

    // Se foi solicitado criar usuário automaticamente
    if (data.createUser && data.password && data.email) {
      // Verificar se já existe usuário com este email
      const existingUser = await userRepository.findOneBy({
        email: data.email,
      });
      if (existingUser) {
        throw new BadRequestError("Já existe um usuário com este email");
      }

      // Criar usuário customer
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = userRepository.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
      });

      const savedUser = await userRepository.save(user);
      customer.user = savedUser;
      customer.userId = savedUser.id;
    } // Se foi fornecido userId, vincular com usuário existente
    else if (data.userId) {
      const user = await userRepository.findOneBy({ id: data.userId });
      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }
      if (user.role !== UserRole.CUSTOMER) {
        throw new BadRequestError("Usuário deve ter role de customer");
      }
      customer.user = user;
      customer.userId = data.userId;
    }

    await customerRepository.save(customer);

    const action = data?.id ? "atualizado" : "cadastrado";

    res.status(201).json({
      message: `Cliente ${action} com sucesso`,
      customer,
    });
  }

  async getAll(_req: Request, res: Response) {
    try {
      const customers = await customerRepository.find({
        relations: ["user"],
        order: { name: "ASC" },
      });
      res.status(200).json(customers);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      res.status(500).json({
        message: "Erro ao buscar clientes",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;

    const customer = await customerRepository.findOne({
      where: { id: Number(id) },
      relations: ["user", "appointments"],
    });

    if (!customer) {
      throw new NotFoundError("Cliente não encontrado");
    }

    res.status(200).json(customer);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const customer = await customerRepository.findOneBy({ id: Number(id) });

    if (!customer) {
      throw new NotFoundError("Cliente não encontrado");
    }

    await customerRepository.remove(customer);

    res.status(200).json({
      message: "Cliente excluído com sucesso",
    });
  }

  async linkToUser(req: Request, res: Response) {
    const { customerId, userId } = req.body;

    if (!customerId || !userId) {
      throw new BadRequestError(
        "ID do cliente e ID do usuário são obrigatórios",
      );
    }

    // Verificar se o cliente existe e não possui usuário vinculado
    const customer = await customerRepository.findOne({
      where: { id: customerId },
      relations: ["user"],
    });

    if (!customer) {
      throw new NotFoundError("Cliente não encontrado");
    }

    if (customer.user) {
      throw new BadRequestError("Cliente já possui usuário vinculado");
    }

    // Verificar se o usuário existe e tem role de customer
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    if (user.role !== UserRole.CUSTOMER) {
      throw new BadRequestError("Usuário deve ter role de customer");
    }

    // Verificar se o usuário já está vinculado a outro cliente
    const existingCustomer = await customerRepository.findOne({
      where: { userId: userId },
    });

    if (existingCustomer) {
      throw new BadRequestError("Usuário já está vinculado a outro cliente");
    }

    // Realizar o vínculo
    customer.user = user;
    customer.userId = userId;
    await customerRepository.save(customer);

    res.status(200).json({
      message: "Cliente vinculado ao usuário com sucesso",
      customer,
    });
  }

  async unlinkFromUser(req: Request, res: Response) {
    const { id } = req.params;

    const customer = await customerRepository.findOne({
      where: { id: Number(id) },
      relations: ["user"],
    });

    if (!customer) {
      throw new NotFoundError("Cliente não encontrado");
    }

    if (!customer.user) {
      throw new BadRequestError("Cliente não possui usuário vinculado");
    }

    // Desvincular
    customer.user = null;
    customer.userId = null;
    await customerRepository.save(customer);

    res.status(200).json({
      message: "Cliente desvinculado do usuário com sucesso",
      customer,
    });
  }

  async searchUnlinkedUsers(req: Request, res: Response) {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      throw new BadRequestError("Email é obrigatório para a busca");
    }

    try {
      // Buscar todos os usuários com role customer que correspondem ao email
      const users = await userRepository
        .createQueryBuilder("user")
        .where("user.role = :role", { role: UserRole.CUSTOMER })
        .andWhere("user.email LIKE :email", { email: `%${email}%` })
        .getMany();

      // Buscar todos os clientes que têm usuário vinculado
      const linkedCustomers = await customerRepository
        .createQueryBuilder("customer")
        .where("customer.userId IS NOT NULL")
        .getMany();

      const linkedUserIds = linkedCustomers.map((c) => c.userId).filter((id) =>
        id !== null
      );

      // Filtrar usuários que não estão vinculados
      const unlinkedUsers = users.filter((user) =>
        !linkedUserIds.includes(user.id)
      );

      // Retornar apenas os campos necessários
      const result = unlinkedUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      }));

      res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao buscar usuários não vinculados:", error);
      throw new BadRequestError("Erro ao buscar usuários");
    }
  }
}
