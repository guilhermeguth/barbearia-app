import { faker } from "@faker-js/faker";
import { appointmentRepository } from "../repositories/appointmentRepository";
import { barberRepository } from "../repositories/barberRepository";
import { serviceRepository } from "../repositories/serviceRepository";
import { customerRepository } from "../repositories/customerRepository";

export async function createAppointments() {
  const appointmentRepo = appointmentRepository;
  const customers = await customerRepository.find();
  const barbers = await barberRepository.find();
  const services = await serviceRepository.find();

  if (customers.length === 0 || barbers.length === 0 || services.length === 0) {
    console.log(
      "⚠️ Não há dados suficientes em customers, barbers ou services para criar agendamentos.",
    );
    return;
  }

  const statuses = ["novo", "em andamento", "finalizado", "cancelado"];

  const appointments = Array.from({ length: 20 }).map(() => {
    const customer = faker.helpers.arrayElement(customers);
    const barber = faker.helpers.arrayElement(barbers);
    const service = faker.helpers.arrayElement(services);

    const appointmentDatetime = faker.date.soon({ days: 30 });

    return appointmentRepo.create({
      customer,
      barber,
      service,
      status: faker.helpers.arrayElement(statuses),
      appointmentDatetime,
      createdAt: faker.date.past(),
    });
  });

  await appointmentRepo.save(appointments);
  console.log(
    "✅ Seed: Agendamentos criados com sucesso:",
    appointments.length,
  );
}
