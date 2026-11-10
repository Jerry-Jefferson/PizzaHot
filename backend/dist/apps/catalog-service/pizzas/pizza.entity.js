var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany, } from "typeorm";
let Pizza = class Pizza {
    id;
    name;
    description;
    image;
    price;
    pizzaIngredients;
    lastOrderedAt;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Pizza.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", unique: true }),
    __metadata("design:type", String)
], Pizza.prototype, "name", void 0);
__decorate([
    Column({ type: "text" }),
    __metadata("design:type", String)
], Pizza.prototype, "description", void 0);
__decorate([
    Column({ type: "varchar", nullable: true, default: null }),
    __metadata("design:type", String)
], Pizza.prototype, "image", void 0);
__decorate([
    Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        },
    }),
    __metadata("design:type", Number)
], Pizza.prototype, "price", void 0);
__decorate([
    OneToMany("PizzaIngredient", (pizzaIngredient) => pizzaIngredient.pizza),
    __metadata("design:type", Object)
], Pizza.prototype, "pizzaIngredients", void 0);
__decorate([
    Column({ type: "timestamp", nullable: true, default: null }),
    __metadata("design:type", Date)
], Pizza.prototype, "lastOrderedAt", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Pizza.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Pizza.prototype, "updatedAt", void 0);
Pizza = __decorate([
    Entity("pizzas")
], Pizza);
export { Pizza };
//# sourceMappingURL=pizza.entity.js.map