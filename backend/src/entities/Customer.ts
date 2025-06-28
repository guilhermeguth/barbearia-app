import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Appointment } from "./Appointment";

@Entity({ name: "customers" })
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  email: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone: string;

  @Column({ type: "date", nullable: true })
  birthDate: Date | null;

  @Column({ type: "text", nullable: true })
  notes: string; // Observações do barbeiro sobre o cliente

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Relacionamento opcional com User (para clientes que usam o app)
  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  user: User | null;

  @Column({ type: "int", nullable: true })
  userId: number | null;

  // Cliente pode ter vários agendamentos
  @OneToMany(() => Appointment, (appointment) => appointment.customer)
  appointments: Appointment[];
}
