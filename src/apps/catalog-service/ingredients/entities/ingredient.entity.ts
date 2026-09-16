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

  @OneToMany("PizzaIngredient", (pizzaIngredient: PizzaIngredient) => pizzaIngredient.ingredient)
  pizzaIngredients: Relation<PizzaIngredient[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
