import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../helpers/api-errors';

const errorMiddleware = (
    error: Error & Partial<ApiError>, 
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    const statusCode = error.statusCode ?? 500;
    const message = error.statusCode ? error : 'Internal Server Error';

    res.status(statusCode).json({ message });
}

export default errorMiddleware;