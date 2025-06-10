import { Router } from "express";
import { BarberController } from "./controllers/BarberController";
import { ApiError, BadRequestError } from "./helpers/api-errors";

const routes = Router();
const barberController = new BarberController();

routes.get("/", (req, res) => {
  throw new BadRequestError("Rota não implementada");
});

// Rotas para o BarberController
routes.post("/barber/create", barberController.create);
routes.patch("/barber/update", barberController.update);
routes.get("/barber/getAll", barberController.getAll);

export default routes;
