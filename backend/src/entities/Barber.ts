import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Appointment } from "./Appointment";
import { User } from "./User";

@Entity({ name: "barbers" })
export class Barber {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 100, unique: true })
  email: string;

  @Column({ type: "varchar", length: 15 })
  phone: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Relacionamento obrigatório com User (barbeiro deve ter login)
  @OneToOne(() => User, { nullable: false })
  @JoinColumn()
  user: User;

  @Column({ type: "int" })
  userId: number;

  @OneToMany(() => Appointment, (appointment) => appointment.barber)
  appointments: Appointment[];
}
