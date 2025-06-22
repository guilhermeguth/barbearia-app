import AppDataSource from "../data-source";
import { Service } from "../entities/Service";

export const serviceRepository = AppDataSource.getRepository(Service);
