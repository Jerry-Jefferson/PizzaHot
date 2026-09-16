import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from "typeorm";
import type { CartItem } from "./cart-item.entity.ts";
import { DiscountType } from "../../../promocode-service/promocodes/constants/discount-type.constant.ts";

@Entity("carts")
export class Cart {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", unique: true })
  userId: string;

  @OneToMany("CartItem", (cartItem: CartItem) => cartItem.cart)
  cartItems: Relation<CartItem[]>;

  @Column({ type: "uuid", nullable: true, default: null })
  promocodeId: string | null;

  @Column({ type: "varchar", nullable: true, default: null })
  promocodeCode: string | null;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value === null ? null : parseFloat(value)),
    },
  })
  promocodeDiscount: number | null;

  @Column({ type: "enum", enum: DiscountType, nullable: true, default: null })
  promocodeDiscountType: DiscountType | null;

  @Column({ type: "timestamp", nullable: true, default: null })
  promocodeValidTill: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
