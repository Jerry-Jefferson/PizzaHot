import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("order_item_facts")
export class OrderItemFact {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "uuid" })
  orderId: string;

  @Index()
  @Column({ type: "uuid", nullable: true })
  pizzaId: string | null;

  @Column({ type: "varchar" })
  pizzaName: string;

  @Column({ type: "int" })
  quantity: number;

  @Index()
  @Column({ type: "timestamp" })
  orderedAt: Date;
}
