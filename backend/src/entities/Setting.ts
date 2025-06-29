import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "settings" })
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, unique: true })
  key: string;

  @Column({ type: "text" })
  value: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description?: string;

  @Column({ type: "boolean", default: false })
  isEncrypted: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
