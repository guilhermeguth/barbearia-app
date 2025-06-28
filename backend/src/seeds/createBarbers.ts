import { barberRepository } from "../repositories/barberRepository";
import { userRepository } from "../repositories/userRepository";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { UserRole } from "../entities/User";

export async function createBarbers() {
  const repo = barberRepository;

  // Verificar se já existem barbeiros
  const existingBarbers = await repo.find();
  if (existingBarbers.length > 0) {
    console.log(
      `⚠️ Já existem ${existingBarbers.length} barbeiros. Pulando criação.`,
    );
    return;
  }

  // Criar 10 barbeiros com usuários admin correspondentes
  console.log("🔄 Criando barbeiros com usuários admin...");

  for (let i = 0; i < 10; i++) {
    const name = faker.person.fullName({ sex: "male" });
    const email = faker.internet.email();
    const phone = faker.helpers.replaceSymbols(`(49) 9####-####`);
    const password = await bcrypt.hash("123456", 10); // Senha padrão

    // Criar usuário admin
    const user = userRepository.create({
      name,
      email,
      password,
      role: UserRole.ADMIN,
      createdAt: new Date(),
    });

    const savedUser = await userRepository.save(user);

    // Criar barbeiro
    const barber = repo.create({
      name,
      email,
      phone,
      user: savedUser,
      userId: savedUser.id,
      createdAt: new Date(),
    });

    await repo.save(barber);
  }

  console.log(
    "✅ Seed: 10 barbeiros criados com usuários admin correspondentes",
  );
}
