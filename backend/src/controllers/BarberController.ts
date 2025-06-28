import { Request, Response } from "express";
import { barberRepository } from "../repositories/barberRepository";
import { NotFoundError } from "../helpers/api-errors";

export class BarberController {
  async persist(req: Request, res: Response) {
    const post = req.body;

    let barber = post?.id
      ? await barberRepository.findOneBy({ id: post.id })
      : null;

    if (!barber) {
      barber = barberRepository.create({
        createdAt: new Date(),
      });
    }

    if (!post?.name || !post?.email || !post?.phone) {
      throw new NotFoundError("Nome, email e telefone são obrigatórios");
    }

    barber.name = post.name;
    barber.email = post.email;
    barber.phone = post.phone;

    await barberRepository.save(barber);

    const action = post?.id ? "atualizado" : "cadastrado";

    res.status(201).json({
      message: `Barbeiro ${action} com sucesso`,
      barber,
    });
  }

  async getAll(_req: Request, res: Response) {
    const barbers = await barberRepository.find();

    res.status(200).json(barbers);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const barber = await barberRepository.findOneBy({ id: Number(id) });

    if (!barber) {
      throw new NotFoundError("Barbeiro não encontrado");
    }

    await barberRepository.remove(barber);

    res.status(200).json({
      message: "Barbeiro excluído com sucesso"
    });
  }
}
