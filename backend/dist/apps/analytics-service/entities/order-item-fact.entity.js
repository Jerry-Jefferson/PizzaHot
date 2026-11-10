var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
let OrderItemFact = class OrderItemFact {
    id;
    orderId;
    pizzaId;
    pizzaName;
    quantity;
    orderedAt;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], OrderItemFact.prototype, "id", void 0);
__decorate([
    Column({ type: "uuid" }),
    __metadata("design:type", String)
], OrderItemFact.prototype, "orderId", void 0);
__decorate([
    Column({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], OrderItemFact.prototype, "pizzaId", void 0);
__decorate([
    Index(),
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], OrderItemFact.prototype, "pizzaName", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], OrderItemFact.prototype, "quantity", void 0);
__decorate([
    Index(),
    Column({ type: "timestamp" }),
    __metadata("design:type", Date)
], OrderItemFact.prototype, "orderedAt", void 0);
OrderItemFact = __decorate([
    Entity("order_item_facts"),
    Index(["orderId", "pizzaName"], { unique: true })
], OrderItemFact);
export { OrderItemFact };
//# sourceMappingURL=order-item-fact.entity.js.map