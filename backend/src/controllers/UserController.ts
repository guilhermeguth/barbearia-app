import { Request, Response } from "express";
import { BadRequestError } from "../helpers/api-errors";
import { userRepository } from "../repositories/userRepository";
import bcrypt from "bcrypt";

export class UserController {
  async create(req: Request, res: Response) {
    const post = req.body;

    if (!post || !post.email || !post.name || !post.password) {
      throw new BadRequestError("Informe os dados do usuário");
    }

    const userExists = await userRepository.findOneBy({ email: post.email });

    if (userExists) {
      throw new BadRequestError("Usuário já cadastrado");
    }

    const hashPassword = await bcrypt.hash(post.password, 10);

    const user = userRepository.create({
      name: post.name,
      email: post.email,
      password: hashPassword,
    });

    await userRepository.save(user);

    res.status(201).json({
      message: "Usuário criado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }
}
