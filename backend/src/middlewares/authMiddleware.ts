import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../helpers/api-errors";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository";

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.method === "OPTIONS") {
    return next(); // libera preflight
  }

  const { authorization } = req.headers;

  if (!authorization) {
    throw new UnauthorizedError("Usuário não autorizado");
  }

  const token = authorization.split(" ")[1];

  const { id } = jwt.verify(
    token,
    process.env.JWT_SECRET ?? "",
  ) as JwtPayload;

  const user = await userRepository.findOne({
    where: { id },
    relations: ["customer", "barber"],
  });

  if (!user) {
    throw new UnauthorizedError("Usuário não autorizado");
  }

  const { password: _, ...loggedUser } = user;

  req.user = loggedUser;

  next();
};
