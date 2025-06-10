import { Request, Response } from "express";
import { barberRepository } from "../repositories/barberRepository";
import { NotFoundError } from "../helpers/api-errors";

export class BarberController {
  async create(req: Request, res: Response) {
    const post = req.body;

    const newBarber = barberRepository.create({
      name: post.name,
      email: post.email,
      phone: post.phone,
      createdAt: new Date(),
    });

    await barberRepository.save(newBarber);

    res.status(201).json({
      message: "Barbeiro criado com sucesso",
      barber: newBarber,
    });
  }

  async update(req: Request, res: Response) {
    const post = req.body;

    const barber = await barberRepository.findOneBy({ id: post.id });

    if (!barber) {
      throw new NotFoundError("Barbeiro não encontrado");
    }

    barber.name = post.name;
    barber.email = post.email;
    barber.phone = post.phone;

    console.log("Barbeiro atualizado:", barber, post);

    await barberRepository.save(barber);

    console.log("Barbeiro atualizado2:", barber);

    res.status(200).json({
      message: "Barbeiro atualizado com sucesso",
      barber,
    });
  }

  async getAll(req: Request, res: Response) {
    const barbers = await barberRepository.find();

    if (barbers.length === 0) {
      throw new NotFoundError("Nenhum barbeiro encontrado");
    }

    res.status(200).json(barbers);
  }
}
