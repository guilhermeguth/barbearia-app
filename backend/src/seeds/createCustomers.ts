import { faker } from "@faker-js/faker";
import { customerRepository } from "../repositories/customerRepository";

export async function createCustomers() {
  const repo = customerRepository;

  const customers = [];

  // Criar clientes com dados brasileiros mais realistas
  for (let i = 0; i < 15; i++) {
    const customer = repo.create({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.helpers.fromRegExp(/\([0-9]{2}\) [0-9]{5}-[0-9]{4}/), // Formato brasileiro
      birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
      // userId será null por padrão (clientes sem conta no app)
    });

    customers.push(customer);
  }

  await repo.save(customers);
  console.log("✅ Seed: Clientes criados com sucesso:", customers.length);
}
