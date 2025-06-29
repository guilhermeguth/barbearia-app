import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Customer } from "./Customer";
import { Barber } from "./Barber";

export enum UserRole {
  ADMIN = "admin",
  CUSTOMER = "customer",
}

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 100, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Column({
    type: "varchar",
    length: 20,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  photoUrl?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  resetPasswordToken?: string;

  @Column({ type: "timestamp", nullable: true })
  resetPasswordExpires?: Date;

  // Relacionamento opcional - apenas usuários CUSTOMER podem ter perfil de cliente
  @OneToOne(() => Customer, (customer) => customer.user)
  customer: Customer;

  // Relacionamento opcional - apenas usuários ADMIN podem ter perfil de barbeiro
  @OneToOne(() => Barber, (barber) => barber.user)
  barber: Barber;
}
