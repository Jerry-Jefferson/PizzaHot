var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";
let PizzaSnapshot = class PizzaSnapshot {
    id;
    name;
    price;
    image;
    isAvailable;
    updatedAt;
};
__decorate([
    PrimaryColumn({ type: "uuid" }),
    __metadata("design:type", String)
], PizzaSnapshot.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], PizzaSnapshot.prototype, "name", void 0);
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
], PizzaSnapshot.prototype, "price", void 0);
__decorate([
    Column({ type: "varchar", nullable: true, default: null }),
    __metadata("design:type", String)
], PizzaSnapshot.prototype, "image", void 0);
__decorate([
    Column({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], PizzaSnapshot.prototype, "isAvailable", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], PizzaSnapshot.prototype, "updatedAt", void 0);
PizzaSnapshot = __decorate([
    Entity("pizza_snapshot")
], PizzaSnapshot);
export { PizzaSnapshot };
//# sourceMappingURL=pizza-snapshot.entity.js.map