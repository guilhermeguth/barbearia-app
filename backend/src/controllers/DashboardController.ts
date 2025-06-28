import { Request, Response } from "express";
import { barberRepository } from "../repositories/barberRepository";
import { userRepository } from "../repositories/userRepository";
import { serviceRepository } from "../repositories/serviceRepository";
import { customerRepository } from "../repositories/customerRepository";
import { appointmentRepository } from "../repositories/appointmentRepository";
import { AppointmentStatus } from "../entities/Appointment";

export class DashboardController {
  async getMetrics(_req: Request, res: Response) {
    try {
      // Buscar dados dos barbeiros
      const allBarbers = await barberRepository.find();
      const totalBarbers = allBarbers.length;
      
      // Buscar dados dos clientes
      const allCustomers = await customerRepository.find();
      const totalCustomers = allCustomers.length;
      
      // Buscar dados dos usuários
      const allUsers = await userRepository.find();
      const totalUsers = allUsers.length;
      
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
          totalCustomers,
          totalUsers
        },
        // Dados adicionais que podem ser úteis
        summary: {
          barbersActive: totalBarbers, // Por enquanto, todos são considerados ativos
          servicesAvailable: totalServices,
          customersRegistered: totalCustomers,
          usersRegistered: totalUsers,
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

  async getCustomerRanking(_req: Request, res: Response) {
    try {
      // Buscar todos os appointments completos com customer
      const appointments = await appointmentRepository.find({
        where: { status: AppointmentStatus.COMPLETED },
        relations: ['customer']
      });

      // Contar appointments e somar valores por cliente
      const customerCounts = new Map();
      
      appointments.forEach(appointment => {
        if (appointment.customer) {
          const customerId = appointment.customer.id;
          const customerName = appointment.customer.name;
          const appointmentValue = parseFloat(appointment.totalPrice.toString()) || 0;
          
          if (customerCounts.has(customerId)) {
            const existing = customerCounts.get(customerId);
            existing.count++;
            existing.totalValue += appointmentValue;
          } else {
            customerCounts.set(customerId, {
              id: customerId,
              name: customerName,
              count: 1,
              totalValue: appointmentValue
            });
          }
        }
      });

      // Converter para array e ordenar
      const ranking = Array.from(customerCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Formatar dados para o gráfico
      const formattedData = ranking.map(item => ({
        label: item.name || 'Cliente sem nome',
        value: item.count,
        customerId: item.id,
        totalValue: item.totalValue
      }));

      res.status(200).json({
        ranking: formattedData,
        total: formattedData.length,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro ao buscar ranking de clientes:', error);
      res.status(500).json({
        message: 'Erro interno do servidor ao buscar ranking de clientes'
      });
    }
  }

  async getServiceRanking(_req: Request, res: Response) {
    try {
      // Buscar todos os appointments completos com service
      const appointments = await appointmentRepository.find({
        where: { status: AppointmentStatus.COMPLETED },
        relations: ['service']
      });

      // Contar appointments e somar valores por serviço
      const serviceCounts = new Map();
      
      appointments.forEach(appointment => {
        if (appointment.service) {
          const serviceId = appointment.service.id;
          const serviceName = appointment.service.name;
          const servicePrice = parseFloat(appointment.service.price.toString()) || 0;
          
          if (serviceCounts.has(serviceId)) {
            const existing = serviceCounts.get(serviceId);
            existing.count++;
            existing.totalValue += servicePrice;
          } else {
            serviceCounts.set(serviceId, {
              id: serviceId,
              name: serviceName,
              price: servicePrice,
              count: 1,
              totalValue: servicePrice
            });
          }
        }
      });

      // Converter para array e ordenar
      const ranking = Array.from(serviceCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Formatar dados para o gráfico
      const formattedData = ranking.map(item => ({
        label: item.name || 'Serviço sem nome',
        value: item.count,
        serviceId: item.id,
        price: item.price,
        totalValue: item.totalValue
      }));

      res.status(200).json({
        ranking: formattedData,
        total: formattedData.length,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro ao buscar ranking de serviços:', error);
      res.status(500).json({
        message: 'Erro interno do servidor ao buscar ranking de serviços'
      });
    }
  }
}
