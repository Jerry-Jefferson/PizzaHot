import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { Order } from "./order.entity.ts";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne("Order", (order: Order) => order.orderItems, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order: Relation<Order>;

  @Column({ type: "uuid", name: "pizza_id", nullable: true })
  pizzaId: string | null;

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
