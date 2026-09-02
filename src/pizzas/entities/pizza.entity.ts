import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("pizzas")
export class Pizza {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true })
  name: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "varchar", nullable: true })
  image: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
