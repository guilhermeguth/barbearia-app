import { faker } from "@faker-js/faker";
import { userRepository } from "../repositories/userRepository";
import bcrypt from "bcrypt";

export async function createUsers() {
  const repo = userRepository;

  const users = Array.from({ length: 10 }).map(() => {
    const plainPassword = faker.internet.password({ length: 8 });
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);

    return repo.create({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: hashedPassword,
    });
  });

  await repo.save(users);
  console.log("✅ Seed: Usuários criados com sucesso:", users.length);
}
