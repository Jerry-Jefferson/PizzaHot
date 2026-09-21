import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from "typeorm";
import type { CartItem } from "./cart-items/cart-item.entity.ts";
import { DiscountMode } from "../../libs/contracts/index.ts";
import { checkIn, checkName } from "../../libs/database/check-in.util.ts";

@Entity("carts")
@Check(
  checkName("carts", "promocodeDiscountMode"),
  checkIn("promocodeDiscountMode", Object.values(DiscountMode))
)
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

  @Column({ type: "varchar", length: 32, nullable: true, default: null })
  promocodeDiscountMode: DiscountMode | null;

  @Column({ type: "timestamp", nullable: true, default: null })
  promocodeValidTill: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
