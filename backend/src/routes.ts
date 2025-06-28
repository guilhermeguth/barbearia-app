import { Router } from "express";
import { BarberController } from "./controllers/BarberController";
import { UserController } from "./controllers/UserController";
import { AuthController } from "./controllers/AuthController";
import { DashboardController } from "./controllers/DashboardController";
import { ServiceController } from "./controllers/ServiceController";
import { CustomerController } from "./controllers/CustomerController";
import { AppointmentController } from "./controllers/AppointmentController";
import { authMiddleware } from "./middlewares/authMiddleware";
import { uploadBarberPhoto, uploadUserPhoto } from "./middlewares/uploadMiddleware";

const routes = Router();

const barberController = new BarberController();
const userController = new UserController();
const authController = new AuthController();
const dashboardController = new DashboardController();
const serviceController = new ServiceController();
const customerController = new CustomerController();
const appointmentController = new AppointmentController();

routes.post("/user/create", userController.create);
routes.post("/auth/login", authController.login);

routes.use(authMiddleware);

// Rota do dashboard
routes.get("/dashboard", dashboardController.getMetrics);

// Rotas de usuários (autenticadas)
routes.post("/user/change-password", userController.changePassword);
routes.get("/user/profile", userController.getProfile);
routes.post("/user/profile", uploadUserPhoto.single('photo'), userController.updateProfile);

// Rotas de barbeiros
routes.post("/barbers", uploadBarberPhoto.single('photo'), barberController.persist);
routes.get("/barbers", barberController.getAll);
routes.delete("/barbers/:id", barberController.delete);

// Rotas de serviços
routes.post("/services", serviceController.persist);
routes.get("/services", serviceController.getAll);
routes.delete("/services/:id", serviceController.delete);

// Rotas de clientes
routes.post("/customers", customerController.persist);
routes.get("/customers", customerController.getAll);
routes.get(
  "/customers/search-unlinked-users",
  customerController.searchUnlinkedUsers,
);
routes.get("/customers/:id", customerController.getById);
routes.delete("/customers/:id", customerController.delete);
routes.post("/customers/link-user", customerController.linkToUser);
routes.delete("/customers/:id/unlink-user", customerController.unlinkFromUser);

// Rotas de agendamentos
routes.post("/appointments", appointmentController.create);
routes.get("/appointments", appointmentController.getAll);
routes.get("/appointments/:id", appointmentController.getById);
routes.put("/appointments/:id", appointmentController.update);
routes.delete("/appointments/:id", appointmentController.delete);
routes.put("/appointments/:id/cancel", appointmentController.cancel);
routes.get("/appointments/date/:date", appointmentController.getByDate);
routes.get(
  "/appointments/available-slots/:barberId/:date",
  appointmentController.getAvailableSlots,
);

routes.post("/auth/logout", authController.logout);
routes.get("/auth/authenticate", authController.authenticate);

export default routes;
