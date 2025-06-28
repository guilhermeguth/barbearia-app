import { Router } from "express";
import { BarberController } from "./controllers/BarberController";
import { UserController } from "./controllers/UserController";
import { AuthController } from "./controllers/AuthController";
import { DashboardController } from "./controllers/DashboardController";
import { ServiceController } from "./controllers/ServiceController";
import { authMiddleware } from "./middlewares/authMiddleware";

const routes = Router();

const barberController = new BarberController();
const userController = new UserController();
const authController = new AuthController();
const dashboardController = new DashboardController();
const serviceController = new ServiceController();

routes.post("/user/create", userController.create);
routes.post("/auth/login", authController.login);

routes.use(authMiddleware);

// Rota do dashboard
routes.get("/dashboard", dashboardController.getMetrics);

// Rotas de barbeiros
routes.post("/barbers", barberController.persist);
routes.get("/barbers", barberController.getAll);
routes.delete("/barbers/:id", barberController.delete);

// Rotas de serviços
routes.post("/services", serviceController.persist);
routes.get("/services", serviceController.getAll);
routes.delete("/services/:id", serviceController.delete);

routes.post("/auth/logout", authController.logout);
routes.get("/auth/authenticate", authController.authenticate);

export default routes;
