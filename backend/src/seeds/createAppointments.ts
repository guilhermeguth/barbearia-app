import { faker } from "@faker-js/faker";
import { appointmentRepository } from "../repositories/appointmentRepository";
import { barberRepository } from "../repositories/barberRepository";
import { serviceRepository } from "../repositories/serviceRepository";
import { customerRepository } from "../repositories/customerRepository";
import { AppointmentStatus } from "../entities/Appointment";

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

  const statuses = [
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED
  ];

  const appointments = Array.from({ length: 20 }).map(() => {
    const customer = faker.helpers.arrayElement(customers);
    const barber = faker.helpers.arrayElement(barbers);
    const service = faker.helpers.arrayElement(services);

    // Gerar data/hora entre hoje e próximos 30 dias, durante horário comercial (8h-18h)
    const futureDate = faker.date.soon({ days: 30 });
    const hour = faker.number.int({ min: 8, max: 17 });
    const scheduledDateTime = new Date(futureDate);
    scheduledDateTime.setHours(hour, 0, 0, 0);

    const status = faker.helpers.arrayElement(statuses);
    
    // Definir timestamps baseado no status
    let startedAt = null;
    let completedAt = null;
    
    if (status === AppointmentStatus.IN_PROGRESS || status === AppointmentStatus.COMPLETED) {
      startedAt = new Date(scheduledDateTime.getTime() + 5 * 60000); // 5 minutos após agendamento
    }
    
    if (status === AppointmentStatus.COMPLETED) {
      completedAt = new Date(startedAt!.getTime() + 45 * 60000); // 45 minutos de duração
    }

    return appointmentRepo.create({
      customerId: customer.id,
      barberId: barber.id,
      serviceId: service.id,
      scheduledDateTime,
      totalPrice: service.price,
      status,
      startedAt,
      completedAt,
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 })
    });
  });

  await appointmentRepo.save(appointments);
  console.log(
    "✅ Seed: Agendamentos criados com sucesso:",
    appointments.length,
  );
}
