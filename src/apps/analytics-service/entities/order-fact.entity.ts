import { Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity("order_facts")
export class OrderFact {
  @PrimaryColumn({ type: "uuid" })
  orderId: string;

  @Index()
  @Column({ type: "uuid", nullable: true })
  userId: string | null;

  @Column({ type: "varchar", nullable: true })
  userEmail: string | null;

  @Column({ type: "varchar", nullable: true })
  userName: string | null;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  finalPrice: number;

  @Index()
  @Column({ type: "timestamp" })
  createdAt: Date;

  @Column({ type: "varchar", default: "pending" })
  status: string;
}
