import { faker } from "@faker-js/faker";
import { userRepository } from "../repositories/userRepository";
import bcrypt from "bcrypt";

export async function createUsers() {
  const repo = userRepository;

  // Criar usuário admin
  const adminPassword = bcrypt.hashSync("123456", 10);
  const adminUser = repo.create({
    name: "Admin",
    email: "admin@barbearia.com",
    password: adminPassword,
  });

  const users = Array.from({ length: 10 }).map(() => {
    const plainPassword = faker.internet.password({ length: 8 });
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);

    return repo.create({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: hashedPassword,
    });
  });

  // Adicionar admin no início da lista
  users.unshift(adminUser);

  await repo.save(users);
  console.log("✅ Seed: Usuários criados com sucesso:", users.length);
  console.log("🔑 Admin criado: admin@barbearia.com / 123456");
}
