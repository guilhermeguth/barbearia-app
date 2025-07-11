import { NextFunction, Request, Response } from "express";

// Middleware para verificar roles de usuário
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Verificar se o usuário está autenticado
      if (!req.user) {
        res.status(401).json({
          message: "Usuário não autenticado",
        });
        return;
      }

      // Verificar se o usuário tem o role necessário
      // const userRole = req.user.role;
      // if (!userRole || !allowedRoles.includes(userRole)) {
      //   res.status(403).json({
      //     message: "Acesso negado. Permissões insuficientes.",
      //     requiredRoles: allowedRoles,
      //     userRole: userRole,
      //   });
      //   return;
      // }

      next();
    } catch (error) {
      console.error("Erro no middleware de role:", error);
      res.status(500).json({
        message: "Erro interno do servidor",
      });
    }
  };
};

// Middleware específico para admin
export const requireAdmin = requireRole(["admin"]);

// Middleware específico para barbeiros
export const requireBarber = requireRole(["admin", "barber"]);

// Middleware para clientes (ou qualquer usuário autenticado)
export const requireCustomer = requireRole(["admin", "barber", "customer"]);
