import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Customer } from "./Customer";
import { Barber } from "./Barber";
import { Service } from "./Service";

export enum AppointmentStatus {
  SCHEDULED = "scheduled", // Agendado
  IN_PROGRESS = "in_progress", // Em andamento
  COMPLETED = "completed", // Concluído
  CANCELLED = "cancelled", // Cancelado
}

export enum RecurrenceType {
  NONE = "none", // Agendamento único
  WEEKLY = "weekly", // Semanal
  BIWEEKLY = "biweekly", // Quinzenal
  MONTHLY = "monthly", // Mensal
}

@Entity({ name: "appointments" })
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.appointments, {
    eager: true,
  })
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
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "total_price" })
  totalPrice: number;

  @Column({ type: "text", nullable: true })
  notes: string;

  // Campos para agendamentos recorrentes
  @Column({
    type: "enum",
    enum: RecurrenceType,
    default: RecurrenceType.NONE,
    name: "recurrence_type",
  })
  recurrenceType: RecurrenceType;

  @Column({ type: "date", nullable: true, name: "recurrence_end_date" })
  recurrenceEndDate: Date;

  @Column({ type: "int", nullable: true, name: "parent_appointment_id" })
  parentAppointmentId: number;

  @Column({ type: "boolean", default: false, name: "is_recurring_parent" })
  isRecurringParent: boolean;

  @Column({ type: "timestamp", nullable: true, name: "started_at" })
  startedAt: Date;

  @Column({ type: "timestamp", nullable: true, name: "completed_at" })
  completedAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
