import { NextFunction, Request, Response } from "express";
import { ApiError } from "../helpers/api-errors";

const errorMiddleware = (
  error: Error & Partial<ApiError>,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = error.statusCode ?? 500;
  const message = error.statusCode ? error.message : "Internal Server Error";

  // Log do erro para debug
  console.error('🔥 Error middleware:', {
    statusCode,
    message: error.message,
    stack: error.stack
  });

  res.status(statusCode).json({ message });
};

export default errorMiddleware;
