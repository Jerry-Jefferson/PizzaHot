import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("order_item_facts")
@Index(["orderId", "pizzaName"], { unique: true })
export class OrderItemFact {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  orderId: string;

  @Column({ type: "uuid", nullable: true })
  pizzaId: string | null;

  @Index()
  @Column({ type: "varchar" })
  pizzaName: string;

  @Column({ type: "int" })
  quantity: number;

  @Index()
  @Column({ type: "timestamp" })
  orderedAt: Date;
}
