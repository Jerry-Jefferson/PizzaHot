import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Gender } from "../constants/gender.enum.ts";
import { Role } from "../../../../libs/common/constants/role.enum.ts";

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

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: "varchar", nullable: true })
  verificationToken: string | null;

  @Column({ type: "timestamp", nullable: true })
  verificationTokenExpiresAt: Date | null;

  @Column({ type: "varchar", nullable: true })
  name: string | null;

  @Column({ type: "varchar", nullable: true })
  surname: string | null;

  @Column({ type: "enum", enum: Gender, nullable: true })
  gender: Gender | null;

  @Column({ type: "varchar", nullable: true })
  image: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
