import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { DiscountMode } from "../../libs/contracts/index.ts";
import { checkIn, checkName } from "../../libs/database/check-in.util.ts";

@Entity("promocodes")
@Check(
  checkName("promocodes", "discountMode"),
  checkIn("discountMode", Object.values(DiscountMode))
)
export class Promocode {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true })
  code: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  discount: number;

  @Column({ type: "timestamp" })
  validTill: Date;

  @Column({ type: "varchar", length: 32 })
  discountMode: DiscountMode;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
