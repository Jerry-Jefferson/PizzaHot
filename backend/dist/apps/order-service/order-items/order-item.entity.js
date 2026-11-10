var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from "typeorm";
let OrderItem = class OrderItem {
    id;
    order;
    pizzaId;
    pizzaName;
    priceAtPurchase;
    quantity;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], OrderItem.prototype, "id", void 0);
__decorate([
    ManyToOne("Order", (order) => order.orderItems, { onDelete: "CASCADE" }),
    JoinColumn({ name: "order_id" }),
    __metadata("design:type", Object)
], OrderItem.prototype, "order", void 0);
__decorate([
    Column({ type: "uuid", name: "pizza_id", nullable: true }),
    __metadata("design:type", String)
], OrderItem.prototype, "pizzaId", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], OrderItem.prototype, "pizzaName", void 0);
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
], OrderItem.prototype, "priceAtPurchase", void 0);
__decorate([
    Column({ type: "int", default: 1 }),
    __metadata("design:type", Number)
], OrderItem.prototype, "quantity", void 0);
OrderItem = __decorate([
    Entity("order_items")
], OrderItem);
export { OrderItem };
//# sourceMappingURL=order-item.entity.js.map