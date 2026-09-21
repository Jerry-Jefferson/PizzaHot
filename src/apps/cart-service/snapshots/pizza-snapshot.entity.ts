import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("pizza_snapshot")
export class PizzaSnapshot {
  @PrimaryColumn({ type: "uuid" })
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price: number;

  @Column({ type: "varchar", nullable: true, default: null })
  image: string | null;

  @Column({ type: "boolean", default: true })
  isAvailable: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
