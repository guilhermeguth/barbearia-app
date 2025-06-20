import { Router } from "express";
import { BarberController } from "./controllers/BarberController";

const routes = Router();
const barberController = new BarberController();

// Rotas para o BarberController
routes.post("/barber/persist", barberController.persist);
routes.get("/barber/getAll", barberController.getAll);

export default routes;
