import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../helpers/api-errors";
import { JwtPayload } from "jsonwebtoken";
import { userRepository } from "../repositories/userReposirory";
import jwt from "jsonwebtoken";

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new UnauthorizedError("Usuário não autorizado");
  }

  const token = authorization.split(" ")[1];

  const { id } = jwt.verify(
    token,
    process.env.JWT_SECRET ?? "",
  ) as JwtPayload;

  const user = await userRepository.findOneBy({ id });

  if (!user) {
    throw new UnauthorizedError("Usuário não autorizado");
  }

  const { password: _, ...loggedUser } = user;

  req.user = loggedUser;

  next();
};
