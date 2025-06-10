import AppDataSource from "../data-source";
import { Barber } from "../entities/Barber";

export const barberRepository = AppDataSource.getRepository(Barber);
