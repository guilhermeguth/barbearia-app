import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Barber } from "./Barber";
import { Service } from "./Service";

@Entity({ name: "appointments" })
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.appointments)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Barber, (barber) => barber.appointments)
  @JoinColumn({ name: "barber_id" })
  barber: Barber;

  @ManyToOne(() => Service, (service) => service.appointments)
  @JoinColumn({ name: "service_id" })
  service: Service;

  @Column({ type: "timestamp" })
  appointmentDatetime: Date;

  @Column({ type: "varchar", length: 20 })
  status: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  updatedAt: Date;
}
