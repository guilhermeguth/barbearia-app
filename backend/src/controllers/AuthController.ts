import { Request, Response } from "express";
import { userRepository } from "../repositories/userRepository";
import { BadRequestError } from "../helpers/api-errors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

type JwtPayLoad = {
  id: number;
};

export class AuthController {
  async login(req: Request, res: Response) {
    const post = req.body;

    const user = await userRepository.findOneBy({ email: post.email });

    if (!user) {
      throw new BadRequestError("E-mail ou senha inválidos");
    }

    const verifyPassword = await bcrypt.compare(post.password, user.password);

    if (!verifyPassword) {
      throw new BadRequestError("E-mail ou senha inválidos");
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET ?? "",
      {
        expiresIn: "8h",
      },
    );

    res.status(201).json({
      message: "Usuário logado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  }

  authenticate(req: Request, res: Response) {
    res.status(200).json({
      message: "Usuário autenticado com sucesso",
      user: req.user,
    });
  }

  async logout(_req: Request, res: Response) {
    // implementar lógica de logout
    await res.status(200).json({ message: "Usuário deslogado com sucesso" });
  }
}
