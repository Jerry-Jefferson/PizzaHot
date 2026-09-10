import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import type { Pizza } from "../../pizzas/entities/pizza.entity.ts";
import { Order } from "./order.entity.ts";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne("Order", (order: Order) => order.orderItems, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order: Relation<Order>;

  @ManyToOne("Pizza", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "pizza_id" })
  pizza: Relation<Pizza> | null;

  @Column({ type: "varchar" })
  pizzaName: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  priceAtPurchase: number;

  @Column({ type: "int", default: 1 })
  quantity: number;
}
