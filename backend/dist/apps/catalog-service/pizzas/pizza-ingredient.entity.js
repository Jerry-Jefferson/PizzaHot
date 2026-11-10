var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
let PizzaIngredient = class PizzaIngredient {
    id;
    pizza;
    ingredient;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], PizzaIngredient.prototype, "id", void 0);
__decorate([
    ManyToOne("Pizza", (pizza) => pizza.pizzaIngredients, { onDelete: "CASCADE" }),
    JoinColumn({ name: "pizza_id" }),
    __metadata("design:type", Object)
], PizzaIngredient.prototype, "pizza", void 0);
__decorate([
    ManyToOne("Ingredient", (ingredient) => ingredient.pizzaIngredients, {
        onDelete: "CASCADE",
    }),
    JoinColumn({ name: "ingredient_id" }),
    __metadata("design:type", Object)
], PizzaIngredient.prototype, "ingredient", void 0);
PizzaIngredient = __decorate([
    Entity("pizza_ingredients")
], PizzaIngredient);
export { PizzaIngredient };
//# sourceMappingURL=pizza-ingredient.entity.js.map