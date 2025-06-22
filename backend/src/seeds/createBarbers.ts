import { barberRepository } from "../repositories/barberRepository";
import { faker } from "@faker-js/faker";

export async function createBarbers() {
  const repo = barberRepository;
  const barbers = Array.from({ length: 10 }).map(() =>
    repo.create({
      name: faker.person.fullName({ sex: "male" }),
      email: faker.internet.email(),
      phone: faker.helpers.replaceSymbols(`(49) 9####-####`),
    })
  );

  await repo.save(barbers);
  console.log("✅ Seed: Barbeiros criados com sucesso:", barbers.length);
}
