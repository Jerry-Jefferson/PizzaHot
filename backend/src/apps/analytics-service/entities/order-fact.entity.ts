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
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value === null ? null : parseFloat(value)),
    },
  })
  finalPrice: number | null;

  @Index()
  @Column({ type: "timestamp", nullable: true })
  createdAt: Date | null;

  @Column({ type: "varchar", default: "pending" })
  status: string;
}
