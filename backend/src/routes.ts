import { Router } from "express";
import { BarberController } from "./controllers/BarberController";
import { UserController } from "./controllers/UserController";
import { AuthController } from "./controllers/AuthController";
import { DashboardController } from "./controllers/DashboardController";
import { ServiceController } from "./controllers/ServiceController";
import { CustomerController } from "./controllers/CustomerController";
import { AppointmentController } from "./controllers/AppointmentController";
import { ReminderController } from "./controllers/ReminderController";
import { SettingsController } from "./controllers/SettingsController";
import { authMiddleware } from "./middlewares/authMiddleware";
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

// Rota do dashboard
routes.get("/dashboard", dashboardController.getMetrics);
routes.get(
  "/dashboard/customer-ranking",
  dashboardController.getCustomerRanking,
);
routes.get("/dashboard/service-ranking", dashboardController.getServiceRanking);

// Rotas de usuários (autenticadas)
routes.post("/user/change-password", userController.changePassword);
routes.get("/user/profile", userController.getProfile);
routes.post(
  "/user/profile",
  uploadUserPhoto.single("photo"),
  userController.updateProfile,
);

// Rotas de barbeiros
routes.post(
  "/barbers",
  uploadBarberPhoto.single("photo"),
  barberController.persist,
);
routes.get("/barbers", barberController.getAll);
routes.delete("/barbers/:id", barberController.delete);
routes.get("/barbers/:id/working-hours", barberController.getWorkingHours);
routes.put("/barbers/:id/working-hours", barberController.updateWorkingHours);

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
routes.post(
  "/appointments/:id/send-reminder",
  appointmentController.sendReminder,
);
routes.get(
  "/appointments/notification-status",
  (req, res) => appointmentController.getNotificationStatus(req, res),
);
routes.get(
  "/appointments/reminder-status",
  (req, res) => reminderController.getStatus(req, res),
);
routes.post(
  "/appointments/test-reminders",
  (req, res) => reminderController.runTest(req, res),
);
routes.get(
  "/appointments/date/:date",
  (req, res) => appointmentController.getByDate(req, res),
);

// Rota para horários disponíveis
routes.get(
  "/appointments/available-slots/:barberId/:date/:serviceDuration",
  async (req, res) => {
    await appointmentController.getAvailableSlots(req, res);
  },
);

routes.get(
  "/appointments/calendar/events",
  (req, res) => {
    appointmentController.getCalendarEvents(req, res);
  },
);
routes.put("/appointments/:id/move", appointmentController.moveAppointment);
routes.post(
  "/appointments/recurring",
  appointmentController.createRecurringAppointment,
);

// Rotas de configurações (apenas para admin)
routes.get("/settings/test", settingsController.test);
routes.get("/settings", settingsController.getSettings);
routes.get("/settings/smtp", settingsController.getSmtpConfig);
routes.put("/settings/smtp", settingsController.updateSmtpConfig);
routes.post("/settings/smtp/test", settingsController.testSmtpConnection);
routes.post("/settings/smtp/send-test", settingsController.sendTestEmail);
routes.post("/settings/initialize", settingsController.initializeSettings);

routes.post("/auth/logout", authController.logout);
routes.get("/auth/authenticate", authController.authenticate);

export default routes;
