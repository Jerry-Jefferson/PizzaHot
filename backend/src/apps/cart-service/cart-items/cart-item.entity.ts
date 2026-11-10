import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Unique,
  type Relation,
} from "typeorm";
import type { PizzaSnapshot } from "../snapshots/pizza-snapshot.entity.ts";
import type { Cart } from "../cart.entity.ts";

@Entity("cart_items")
@Unique(["cart", "pizza"])
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne("Cart", (cart: Cart) => cart.cartItems, { onDelete: "CASCADE" })
  @JoinColumn({ name: "cart_id" })
  cart: Relation<Cart>;

  @ManyToOne("PizzaSnapshot", { onDelete: "CASCADE" })
  @JoinColumn({ name: "pizza_id" })
  pizza: Relation<PizzaSnapshot>;

  @Column({ type: "int", default: 1 })
  quantity: number;
}
