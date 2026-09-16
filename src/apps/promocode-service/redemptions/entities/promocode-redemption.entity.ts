import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { RedemptionStatus } from "../constants/redemption-status.constant.ts";

@Entity("promocode_redemptions")
@Index(["userId", "promocodeId"], { unique: true })
export class PromocodeRedemption {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ type: "uuid" })
  promocodeId: string;

  @Column({ type: "uuid", nullable: true })
  orderId: string | null;

  @Column({ type: "enum", enum: RedemptionStatus, default: RedemptionStatus.PENDING })
  status: RedemptionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
