import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Gender } from "../constants/gender.enum.ts";
import { Role } from "../constants/role.enum.ts";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: Role, default: Role.USER })
  role: Role;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column({ type: "enum", enum: Gender })
  gender: Gender;

  @Column()
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
