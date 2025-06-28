import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Customer } from "./Customer";
import { Barber } from "./Barber";
import { Service } from "./Service";

export enum AppointmentStatus {
  SCHEDULED = "scheduled",     // Agendado
  IN_PROGRESS = "in_progress", // Em andamento
  COMPLETED = "completed",     // Concluído
  CANCELLED = "cancelled"      // Cancelado
}

@Entity({ name: "appointments" })
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.appointments, { eager: true })
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  @Column({ name: "customer_id" })
  customerId: number;

  @ManyToOne(() => Barber, (barber) => barber.appointments, { eager: true })
  @JoinColumn({ name: "barber_id" })
  barber: Barber;

  @Column({ name: "barber_id" })
  barberId: number;

  @ManyToOne(() => Service, (service) => service.appointments, { eager: true })
  @JoinColumn({ name: "service_id" })
  service: Service;

  @Column({ name: "service_id" })
  serviceId: number;

  @Column({ type: "timestamp", name: "scheduled_date_time" })
  scheduledDateTime: Date;

  @Column({ 
    type: "enum", 
    enum: AppointmentStatus, 
    default: AppointmentStatus.SCHEDULED 
  })
  status: AppointmentStatus;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "total_price" })
  totalPrice: number;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({ type: "timestamp", nullable: true, name: "started_at" })
  startedAt: Date;

  @Column({ type: "timestamp", nullable: true, name: "completed_at" })
  completedAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
