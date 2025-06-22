import { faker } from "@faker-js/faker";
import { serviceRepository } from "../repositories/serviceRepository";

const barbershopServices = [
  { name: "Corte Clássico", duration: 30 },
  { name: "Corte Degradê", duration: 30 },
  { name: "Barba Tradicional", duration: 30 },
  { name: "Barba Desenhada", duration: 30 },
  { name: "Corte e Barba", duration: 60 },
  { name: "Aparar Bigode", duration: 30 },
  { name: "Corte Infantil", duration: 30 },
  { name: "Tratamento Capilar", duration: 60 },
  { name: "Coloração Masculina", duration: 60 },
  { name: "Design de Sobrancelha", duration: 30 },
];

export async function createServices() {
  const repo = serviceRepository;

  const services = barbershopServices.map(({ name, duration }) =>
    repo.create({
      name,
      price: parseFloat(faker.commerce.price({ min: 20, max: 100, dec: 2 })),
      duration,
    })
  );

  await repo.save(services);
  console.log(
    "✅ Seed: Serviços de barbearia criados com sucesso:",
    services.length,
  );
}
