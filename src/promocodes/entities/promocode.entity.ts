import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from "typeorm";
import { DiscountType } from "../constants/discount-type.constant.ts";
import type { Cart } from "../../carts/entities/cart.entity.ts";

@Entity("promocodes")
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

  @Column({
    type: "enum",
    enum: DiscountType,
  })
  discountType: DiscountType;

  @OneToMany("Cart", (cart: Cart) => cart.promocode)
  carts: Relation<Cart[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
