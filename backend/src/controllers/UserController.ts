import { Request, Response } from "express";
import { BadRequestError } from "../helpers/api-errors";
import { userRepository } from "../repositories/userRepository";
import bcrypt from "bcrypt";

import { UserRole } from "../entities/User";
import { customerRepository } from "../repositories/customerRepository";

export class UserController {
  async create(req: Request, res: Response) {
    const post = req.body;

    if (!post || !post.email || !post.name || !post.password) {
      throw new BadRequestError("Informe os dados do usuário");
    }

    const userExists = await userRepository.findOneBy({ email: post.email });

    if (userExists) {
      throw new BadRequestError("Usuário já cadastrado");
    }

    const hashPassword = await bcrypt.hash(post.password, 10);

    // Se for registro de admin, validar a chave
    if (post.role === UserRole.ADMIN) {
      const adminKey = post.adminRegistrationKey;
      if (!adminKey || adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
        throw new BadRequestError("Chave de registro de admin inválida");
      }
    }

    const user = userRepository.create({
      name: post.name,
      email: post.email,
      password: hashPassword,
      role: post.role || UserRole.CUSTOMER,
      phone: post.phone || null,
    });

    await userRepository.save(user);

    let customer = null;
    if (user.role === UserRole.CUSTOMER) {
      customer = customerRepository.create({
        name: user.name,
        email: user.email,
        phone: user.phone,
        birthDate: post.birthDate || null,
        userId: user.id,
        user,
      });
      await customerRepository.save(customer);
    }

    res.status(201).json({
      message: "Usuário criado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        birthDate: customer ? customer.birthDate : null,
      },
    });
  }

  async changePassword(req: Request, res: Response) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!currentPassword || !newPassword) {
      throw new BadRequestError("Senha atual e nova senha são obrigatórias");
    }

    if (newPassword.length < 6) {
      throw new BadRequestError("Nova senha deve ter pelo menos 6 caracteres");
    }

    // Buscar usuário
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestError("Usuário não encontrado");
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestError("Senha atual incorreta");
    }

    // Não permitir usar a mesma senha
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestError(
        "A nova senha deve ser diferente da senha atual"
      );
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    user.password = hashedNewPassword;
    await userRepository.save(user);

    res.status(200).json({
      message: "Senha alterada com sucesso",
    });
  }

  async updateProfile(req: Request, res: Response) {
    const { name, email } = req.body;
    const userId = req.user?.id;
    const uploadedFile = req.file; // Arquivo enviado via multer

    if (!name || !email) {
      throw new BadRequestError("Nome e email são obrigatórios");
    }

    // Buscar usuário
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestError("Usuário não encontrado");
    }

    // Verificar se email já existe (exceto para o próprio usuário)
    if (email !== user.email) {
      const emailExists = await userRepository.findOneBy({ email });
      if (emailExists) {
        throw new BadRequestError("Este email já está em uso");
      }
    }

    // Gerenciar foto de perfil
    let photoPath: string | undefined = user.photoUrl;
    if (uploadedFile) {
      // Se há uma nova foto, deletar a antiga
      if (user.photoUrl) {
        // Importar função de deletar foto de usuário
        const { deleteUserPhoto } = await import("../middlewares/uploadMiddleware");
        deleteUserPhoto(user.photoUrl);
      }
      photoPath = uploadedFile.filename;
    }

    // Atualizar dados
    user.name = name;
    user.email = email;
    if (photoPath !== undefined) {
      user.photoUrl = photoPath;
    }

    await userRepository.save(user);

    const photoUrl = photoPath ? `${req.protocol}://${req.get('host')}/uploads/users/${photoPath}` : null;

    res.status(200).json({
      message: "Perfil atualizado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photoUrl
      }
    });
  }

  async getProfile(req: Request, res: Response) {
    const userId = req.user?.id;

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestError("Usuário não encontrado");
    }

    // Gerar URL completa da foto se existir
    const { getUserPhotoUrl } = await import("../middlewares/uploadMiddleware");
    const photoUrl = getUserPhotoUrl(user.photoUrl || null, req);
    
    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photoUrl,
        role: user.role
      }
    });
  }
}
