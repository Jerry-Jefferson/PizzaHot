import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, type Relation } from "typeorm";
import type { Pizza } from "./pizza.entity.ts";
import type { Ingredient } from "../../ingredients/entities/ingredient.entity.ts";

@Entity("pizza_ingredients")
export class PizzaIngredient {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne("Pizza", (pizza: Pizza) => pizza.pizzaIngredients, { onDelete: "CASCADE" })
  @JoinColumn({ name: "pizza_id" })
  pizza: Relation<Pizza>;

  @ManyToOne("Ingredient", (ingredient: Ingredient) => ingredient.pizzaIngredients, { onDelete: "CASCADE" })
  @JoinColumn({ name: "ingredient_id" })
  ingredient: Relation<Ingredient>;
}
