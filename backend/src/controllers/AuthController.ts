import { Request, Response } from "express";
import { userRepository } from "../repositories/userRepository";
import { barberRepository } from "../repositories/barberRepository";
import { SettingService } from "../repositories/settingRepository";
import { BadRequestError } from "../helpers/api-errors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { UserRole } from "../entities/User";

type JwtPayLoad = {
  id: number;
};

export class AuthController {
  async login(req: Request, res: Response) {
    const post = req.body;

    const user = await userRepository.findOneBy({ email: post.email });

    if (!user) {
      throw new BadRequestError("E-mail ou senha inválidos");
    }

    const verifyPassword = await bcrypt.compare(post.password, user.password);

    if (!verifyPassword) {
      throw new BadRequestError("E-mail ou senha inválidos");
    }

    // Verificar se o usuário é um barbeiro
    const barber = await barberRepository.findOneBy({ userId: user.id });

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET ?? "",
      {
        expiresIn: "8h",
      },
    );

    res.status(201).json({
      message: "Usuário logado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        barberId: barber?.id || null,
      },
      token,
    });
  }

  async authenticate(req: Request, res: Response) {
    // Verificar se o usuário é um barbeiro
    const barber = await barberRepository.findOneBy({ userId: req.user.id });

    res.status(200).json({
      message: "Usuário autenticado com sucesso",
      user: {
        ...req.user,
        barberId: barber?.id || null,
      },
    });
  }

  logout(req: Request, res: Response) {
    console.log("Logout solicitado para usuário:", req.user?.id);

    // Em uma implementação mais robusta, você poderia:
    // - Adicionar o token a uma blacklist
    // - Invalidar refresh tokens
    // - Limpar sessões ativas

    res.status(200).json({
      message: "Usuário deslogado com sucesso",
    });
  }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("Email é obrigatório");
    }

    const user = await userRepository.findOneBy({ email });

    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      res.status(200).json({
        message: "Se o email existir em nosso sistema, você receberá um link para redefinir sua senha.",
      });
      return;
    }

    // Gerar token único para reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no usuário
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await userRepository.save(user);

    try {
      // Buscar configurações SMTP do banco
      const smtpConfig = await SettingService.getSmtpConfig();

      if (!smtpConfig.user || !smtpConfig.pass) {
        throw new BadRequestError("Configurações de email não definidas. Configure o SMTP nas configurações do sistema.");
      }

      // Configurar transporter do nodemailer
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
      });

      console.log('aqui', user, process.env.FRONTEND_URL_APP, process.env.FRONTEND_URL_ADMIN);
      const frontUrl = user.role !== UserRole.ADMIN 
        ? process.env.FRONTEND_URL_APP
        : process.env.FRONTEND_URL_ADMIN;      

      const resetUrl = `${frontUrl}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: smtpConfig.user,
        to: user.email,
        subject: 'Redefinir Senha - Sistema Barbearia',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976D2;">Redefinir Senha</h2>
            <p>Olá, ${user.name}!</p>
            <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #1976D2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Redefinir Senha
            </a>
            <p>Este link expira em 1 hora.</p>
            <p>Se você não solicitou esta redefinição, ignore este email.</p>
            <hr style="margin: 24px 0;">
            <p style="color: #666; font-size: 12px;">Sistema da Barbearia</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: "Se o email existir em nosso sistema, você receberá um link para redefinir sua senha.",
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      
      // Limpar token em caso de erro
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await userRepository.save(user);

      throw new BadRequestError("Erro ao enviar email. Tente novamente mais tarde.");
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new BadRequestError("Token e nova senha são obrigatórios");
    }

    if (newPassword.length < 6) {
      throw new BadRequestError("A senha deve ter pelo menos 6 caracteres");
    }

    const user = await userRepository.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestError("Token inválido ou expirado");
    }

    // Criptografar nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e limpar tokens
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await userRepository.save(user);

    res.status(200).json({
      message: "Senha redefinida com sucesso. Faça login com sua nova senha.",
    });
  }
}
