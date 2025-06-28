import { Request, Response } from "express";
import { serviceRepository } from "../repositories/serviceRepository";
import { NotFoundError } from "../helpers/api-errors";

export class ServiceController {
  async persist(req: Request, res: Response) {
    const post = req.body;

    let service = post?.id
      ? await serviceRepository.findOneBy({ id: post.id })
      : null;

    if (!service) {
      service = serviceRepository.create({
        createdAt: new Date(),
      });
    }

    if (!post?.name || !post?.price || !post?.duration) {
      throw new NotFoundError("Nome, preço e duração são obrigatórios");
    }

    service.name = post.name;
    service.price = parseFloat(post.price);
    service.duration = parseInt(post.duration);

    await serviceRepository.save(service);

    const action = post?.id ? "atualizado" : "cadastrado";

    res.status(201).json({
      message: `Serviço ${action} com sucesso`,
      service,
    });
  }

  async getAll(_req: Request, res: Response) {
    try {
      const services = await serviceRepository.find();

      // Converter price de string para number
      const servicesWithNumericPrice = services.map((service) => ({
        ...service,
        price: typeof service.price === "string"
          ? parseFloat(service.price)
          : service.price,
      }));

      res.status(200).json(servicesWithNumericPrice);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      res.status(500).json({
        message: "Erro ao buscar serviços",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const service = await serviceRepository.findOneBy({ id: Number(id) });

    if (!service) {
      throw new NotFoundError("Serviço não encontrado");
    }

    await serviceRepository.remove(service);

    res.status(200).json({
      message: "Serviço excluído com sucesso",
    });
  }
}
