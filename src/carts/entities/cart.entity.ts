import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from "typeorm";
import type { User } from "../../users/entities/user.entity.ts";
import type { CartItem } from "./cart-item.entity.ts";
import type { Promocode } from "../../promocodes/entities/promocode.entity.ts";

@Entity("carts")
export class Cart {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne("User", { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: Relation<User>;

  @OneToMany("CartItem", (cartItem: CartItem) => cartItem.cart)
  cartItems: Relation<CartItem[]>;

  @ManyToOne("Promocode", (promocode: Promocode) => promocode.carts, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "promocodeId" })
  promocode: Relation<Promocode> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
