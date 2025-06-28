import { Request, Response } from "express";
import { barberRepository } from "../repositories/barberRepository";
import { userRepository } from "../repositories/userRepository";
import { serviceRepository } from "../repositories/serviceRepository";
// import { appointmentRepository } from "../repositories/appointmentRepository";

export class DashboardController {
  async getMetrics(_req: Request, res: Response) {
    try {
      // Buscar dados dos barbeiros
      const allBarbers = await barberRepository.find();
      const totalBarbers = allBarbers.length;
      
      // Buscar dados dos usuários/clientes
      const allUsers = await userRepository.find();
      const totalClients = allUsers.length;
      
      // Buscar dados dos serviços
      const allServices = await serviceRepository.find();
      const totalServices = allServices.length;
      
      // TODO: Implementar quando tivermos as entidades de appointments
      // const appointmentsToday = await appointmentRepository
      //   .createQueryBuilder("appointment")
      //   .where("DATE(appointment.createdAt) = CURRENT_DATE")
      //   .getCount();
      
      // Por enquanto, dados simulados para agendamentos e receita
      const appointmentsToday = Math.floor(Math.random() * 20) + 5;
      const revenueToday = Math.floor(Math.random() * 1000) + 500;
      
      // Estruturar dados do dashboard
      const dashboardData = {
        metrics: {
          appointmentsToday,
          totalBarbers,
          totalServices,
          revenueToday,
          totalClients
        },
        // Dados adicionais que podem ser úteis
        summary: {
          barbersActive: totalBarbers, // Por enquanto, todos são considerados ativos
          servicesAvailable: totalServices,
          clientsRegistered: totalClients,
          appointmentsThisMonth: appointmentsToday * 30, // Simulação
          revenueThisMonth: revenueToday * 30 // Simulação
        },
        lastUpdated: new Date().toISOString()
      };

      res.status(200).json(dashboardData);
      
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      res.status(500).json({
        message: 'Erro interno do servidor ao buscar dados do dashboard'
      });
    }
  }
}
