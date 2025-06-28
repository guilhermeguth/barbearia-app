import { Router } from "express";
import { BarberController } from "./controllers/BarberController";
import { UserController } from "./controllers/UserController";
import { AuthController } from "./controllers/AuthController";
import { authMiddleware } from "./middlewares/authMiddleware";

const routes = Router();

const barberController = new BarberController();
const userController = new UserController();
const authController = new AuthController();

routes.post("/user/create", userController.create);
routes.post("/auth/login", authController.login);

routes.use(authMiddleware);

routes.post("/barbers", barberController.persist);
routes.get("/barbers", barberController.getAll);
routes.delete("/barbers/:id", barberController.delete);

routes.post("/auth/logout", authController.logout);
routes.get("/auth/authenticate", authController.authenticate);

export default routes;
