import { Router } from "express";
import { BarberController } from "./controllers/BarberController";
import { UserController } from "./controllers/UserController";
import { AuthController } from "./controllers/AuthController";
import { DashboardController } from "./controllers/DashboardController";
import { ServiceController } from "./controllers/ServiceController";
import { CustomerController } from "./controllers/CustomerController";
import { AppointmentController } from "./controllers/AppointmentController";
import { CustomerAppointmentController } from "./controllers/CustomerAppointmentController";
import { ReminderController } from "./controllers/ReminderController";
import { SettingsController } from "./controllers/SettingsController";
import { authMiddleware } from "./middlewares/authMiddleware";
import {
  requireAdmin,
  requireBarber,
  requireCustomer,
} from "./middlewares/roleMiddleware";
import {
  uploadBarberPhoto,
  uploadUserPhoto,
} from "./middlewares/uploadMiddleware";

const routes = Router();

const barberController = new BarberController();
const userController = new UserController();
const authController = new AuthController();
const dashboardController = new DashboardController();
const serviceController = new ServiceController();
const customerController = new CustomerController();
const appointmentController = new AppointmentController();
const customerAppointmentController = new CustomerAppointmentController();
const reminderController = new ReminderController();
const settingsController = new SettingsController();

routes.post("/user/create", userController.create);
routes.post("/auth/login", authController.login);
routes.post("/auth/forgot-password", authController.forgotPassword);
routes.post("/auth/reset-password", authController.resetPassword);

// Rota de teste para debug
routes.get("/test-reminder", (_req, res) => {
  res.json({
    message: "Endpoint de teste funcionando",
    timestamp: new Date().toISOString(),
  });
});

// Rota de teste do ReminderService sem autenticação
routes.get("/test-reminder-service", (_req, res) => {
  try {
    const { ReminderService } = require("./services/reminderService");
    const status = ReminderService.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack",
    });
  }
});

// Rotas dos lembretes SEM autenticação (temporário para debug)
routes.get("/reminder-status-public", (_req, res) => {
  try {
    const { ReminderService } = require("./services/reminderService");
    const status = ReminderService.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

routes.get("/notification-status-public", async (_req, res) => {
  try {
    const { NotificationService } = require("./services/notificationService");
    const isEnabled = await NotificationService.areEmailNotificationsEnabled();
    res.json({
      emailNotificationsEnabled: isEnabled,
      message: isEnabled
        ? "Notificações por email estão ativas"
        : "Notificações por email não estão configuradas",
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

routes.post("/test-reminders-public", async (_req, res) => {
  try {
    const { ReminderService } = require("./services/reminderService");
    await ReminderService.runTestReminders();
    res.json({
      message: "Teste de lembretes executado com sucesso",
      note: "Verifique os logs do servidor para detalhes",
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

routes.use(authMiddleware);

// ======= ROTAS PARA CLIENTES (PWA) =======
// Rota para listar barbeiros (disponível para clientes)
routes.get(
  "/client/barbers",
  requireCustomer,
  (req, res) => customerAppointmentController.getAvailableBarbers(req, res),
);

// Rota para listar serviços (disponível para clientes)
routes.get(
  "/client/services",
  requireCustomer,
  (req, res) => customerAppointmentController.getAvailableServices(req, res),
);

// Rota para horários disponíveis (usa o mesmo controller do admin)
routes.get(
  "/client/available-slots/:barberId/:date/:serviceDuration",
  requireCustomer,
  async (req, res) => {
    await appointmentController.getAvailableSlots(req, res);
  },
);

// Rota para criar agendamento (disponível para clientes)
routes.post(
  "/client/appointments",
  requireCustomer,
  (req, res) => customerAppointmentController.createAppointment(req, res),
);

// Rota para listar agendamentos do cliente
routes.get(
  "/client/appointments",
  requireCustomer,
  (req, res) => customerAppointmentController.getMyAppointments(req, res),
);

// Rota para cancelar agendamento (disponível para clientes)
routes.put(
  "/client/appointments/:id/cancel",
  requireCustomer,
  (req, res) => customerAppointmentController.cancelMyAppointment(req, res),
);

// Rotas de perfil do cliente
routes.get(
  "/client/profile",
  requireCustomer,
  (req, res) => customerAppointmentController.getProfile(req, res),
);
routes.put(
  "/client/profile",
  requireCustomer,
  (req, res) => customerAppointmentController.updateProfile(req, res),
);
routes.post(
  "/client/profile/photo",
  requireCustomer,
  uploadUserPhoto.single("photo"),
  (req, res) => customerAppointmentController.updateProfilePhoto(req, res),
);
routes.delete(
  "/client/profile",
  requireCustomer,
  (req, res) => customerAppointmentController.deleteProfile(req, res),
);

// ======= ROTAS ADMINISTRATIVAS (APENAS ADMIN/BARBEIRO) =======

// Rota do dashboard (apenas admin)
routes.get(
  "/dashboard",
  requireAdmin,
  (req, res) => dashboardController.getMetrics(req, res),
);
routes.get(
  "/dashboard/customer-ranking",
  requireAdmin,
  (req, res) => dashboardController.getCustomerRanking(req, res),
);
routes.get(
  "/dashboard/service-ranking",
  requireAdmin,
  (req, res) => dashboardController.getServiceRanking(req, res),
);

// Rotas de usuários (autenticadas)
routes.post("/user/change-password", userController.changePassword);
routes.get("/user/profile", userController.getProfile);
routes.post(
  "/user/profile",
  uploadUserPhoto.single("photo"),
  userController.updateProfile,
);

// Rotas de barbeiros (apenas admin)
routes.post(
  "/barbers",
  requireAdmin,
  uploadBarberPhoto.single("photo"),
  (req, res) => barberController.persist(req, res),
);
routes.get(
  "/barbers",
  requireAdmin,
  (req, res) => barberController.getAll(req, res),
);
routes.delete(
  "/barbers/:id",
  requireAdmin,
  (req, res) => barberController.delete(req, res),
);
routes.get(
  "/barbers/:id/working-hours",
  requireBarber,
  (req, res) => barberController.getWorkingHours(req, res),
);
routes.put(
  "/barbers/:id/working-hours",
  requireBarber,
  (req, res) => barberController.updateWorkingHours(req, res),
);

// Rotas de serviços (apenas admin)
routes.post(
  "/services",
  requireAdmin,
  (req, res) => serviceController.persist(req, res),
);
routes.get(
  "/services",
  requireAdmin,
  (req, res) => serviceController.getAll(req, res),
);
routes.delete(
  "/services/:id",
  requireAdmin,
  (req, res) => serviceController.delete(req, res),
);

// Rotas de clientes (apenas admin)
routes.post(
  "/customers",
  requireAdmin,
  (req, res) => customerController.persist(req, res),
);
routes.get(
  "/customers",
  requireAdmin,
  (req, res) => customerController.getAll(req, res),
);
routes.get(
  "/customers/search-unlinked-users",
  requireAdmin,
  (req, res) => customerController.searchUnlinkedUsers(req, res),
);
routes.get(
  "/customers/:id",
  requireAdmin,
  (req, res) => customerController.getById(req, res),
);
routes.delete(
  "/customers/:id",
  requireAdmin,
  (req, res) => customerController.delete(req, res),
);
routes.post(
  "/customers/link-user",
  requireAdmin,
  (req, res) => customerController.linkToUser(req, res),
);
routes.delete(
  "/customers/:id/unlink-user",
  requireAdmin,
  (req, res) => customerController.unlinkFromUser(req, res),
);

// Rotas de agendamentos (apenas admin/barbeiro)
routes.post(
  "/appointments",
  requireBarber,
  (req, res) => appointmentController.create(req, res),
);
routes.get(
  "/appointments",
  requireBarber,
  (req, res) => appointmentController.getAll(req, res),
);
routes.get(
  "/appointments/:id",
  requireBarber,
  (req, res) => appointmentController.getById(req, res),
);
routes.put(
  "/appointments/:id",
  requireBarber,
  (req, res) => appointmentController.update(req, res),
);
routes.delete(
  "/appointments/:id",
  requireBarber,
  (req, res) => appointmentController.delete(req, res),
);
routes.put(
  "/appointments/:id/cancel",
  requireBarber,
  (req, res) => appointmentController.cancel(req, res),
);
routes.post(
  "/appointments/:id/send-reminder",
  requireBarber,
  (req, res) => appointmentController.sendReminder(req, res),
);
routes.get(
  "/appointments/notification-status",
  requireBarber,
  (req, res) => appointmentController.getNotificationStatus(req, res),
);
routes.get(
  "/appointments/reminder-status",
  requireBarber,
  (req, res) => reminderController.getStatus(req, res),
);
routes.post(
  "/appointments/test-reminders",
  requireAdmin,
  (req, res) => reminderController.runTest(req, res),
);
routes.get(
  "/appointments/date/:date",
  requireBarber,
  (req, res) => appointmentController.getByDate(req, res),
);

// Rota para horários disponíveis (para painel administrativo)
routes.get(
  "/appointments/available-slots/:barberId/:date/:serviceDuration",
  requireBarber,
  async (req, res) => {
    await appointmentController.getAvailableSlots(req, res);
  },
);

routes.get(
  "/appointments/calendar/events",
  requireBarber,
  (req, res) => {
    appointmentController.getCalendarEvents(req, res);
  },
);
routes.put(
  "/appointments/:id/move",
  requireBarber,
  (req, res) => appointmentController.moveAppointment(req, res),
);
routes.post(
  "/appointments/recurring",
  requireBarber,
  (req, res) => appointmentController.createRecurringAppointment(req, res),
);

// Rotas de configurações (apenas para admin)
routes.get(
  "/settings/test",
  requireAdmin,
  (req, res) => settingsController.test(req, res),
);
routes.get(
  "/settings",
  requireAdmin,
  (req, res) => settingsController.getSettings(req, res),
);
routes.get(
  "/settings/smtp",
  requireAdmin,
  (req, res) => settingsController.getSmtpConfig(req, res),
);
routes.put(
  "/settings/smtp",
  requireAdmin,
  (req, res) => settingsController.updateSmtpConfig(req, res),
);
routes.post(
  "/settings/smtp/test",
  requireAdmin,
  (req, res) => settingsController.testSmtpConnection(req, res),
);
routes.post(
  "/settings/smtp/send-test",
  requireAdmin,
  (req, res) => settingsController.sendTestEmail(req, res),
);
routes.post(
  "/settings/initialize",
  requireAdmin,
  (req, res) => settingsController.initializeSettings(req, res),
);

routes.post("/auth/logout", authController.logout);
routes.get("/auth/authenticate", authController.authenticate);

export default routes;
