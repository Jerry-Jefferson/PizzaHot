import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Gender } from "./constants/gender.constant.ts";
import { Role } from "../../../libs/auth/auth.constant.ts";
import { checkIn, checkName } from "../../../libs/database/check-in.util.ts";

@Entity("users")
@Check(checkName("users", "role"), checkIn("role", Object.values(Role)))
@Check(checkName("users", "gender"), checkIn("gender", Object.values(Gender)))
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 32, default: Role.USER })
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

  @Column({ type: "varchar", length: 32, nullable: true })
  gender: Gender | null;

  @Column({ type: "varchar", nullable: true, default: null })
  image: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
