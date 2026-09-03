import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  type Relation,
} from "typeorm";
import type { PizzaIngredient } from "./pizza-ingredient.entity.ts";

@Entity("pizzas")
export class Pizza {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true })
  name: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "varchar", nullable: true })
  image: string | null;

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

  @OneToMany("PizzaIngredient", (pizzaIngredient: PizzaIngredient) => pizzaIngredient.pizza)
  pizzaIngredients: Relation<PizzaIngredient[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
