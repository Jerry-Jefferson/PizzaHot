import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { RedemptionStatus } from "./redemption-status.constant.ts";
import { checkIn, checkName } from "../../../libs/database/check-in.util.ts";

@Entity("promocode_redemptions")
@Index(["userId", "promocodeId"], { unique: true })
@Check(
  checkName("promocode_redemptions", "status"),
  checkIn("status", Object.values(RedemptionStatus))
)
export class PromocodeRedemption {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ type: "uuid" })
  promocodeId: string;

  @Column({ type: "uuid", nullable: true })
  orderId: string | null;

  @Column({ type: "varchar", length: 32, default: RedemptionStatus.PENDING })
  status: RedemptionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
