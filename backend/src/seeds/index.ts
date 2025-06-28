import AppDataSource from "../data-source";
import { createAppointments } from "./createAppointments";
import { createBarbers } from "./createBarbers";
import { createServices } from "./createServices";
import { createUsers } from "./createUsers";
import { createCustomers } from "./createCustomers";

async function seed() {
  await AppDataSource.initialize();

  console.log("🌱 Rodando seeds...");

  await createUsers();
  await createBarbers();
  await createServices();
  await createCustomers();
  await createAppointments();

  await AppDataSource.destroy();

  console.log("🎉 Seeds finalizadas com sucesso!");
}

seed().catch((err) => {
  console.error("❌ Erro ao rodar seeds:", err);
  process.exit(1);
});
