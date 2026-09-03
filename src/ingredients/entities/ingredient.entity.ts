import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  type Relation,
} from "typeorm";
import type { PizzaIngredient } from "../../pizzas/entities/pizza-ingredient.entity.ts";

@Entity("ingredients")
export class Ingredient {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true })
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

  @OneToMany("PizzaIngredient", (pizzaIngredient: PizzaIngredient) => pizzaIngredient.ingredient)
  pizzaIngredients: Relation<PizzaIngredient[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
