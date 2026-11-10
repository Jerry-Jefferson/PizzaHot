var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, Index, PrimaryColumn } from "typeorm";
let OrderFact = class OrderFact {
    orderId;
    userId;
    userEmail;
    userName;
    finalPrice;
    createdAt;
    status;
};
__decorate([
    PrimaryColumn({ type: "uuid" }),
    __metadata("design:type", String)
], OrderFact.prototype, "orderId", void 0);
__decorate([
    Index(),
    Column({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], OrderFact.prototype, "userId", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], OrderFact.prototype, "userEmail", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], OrderFact.prototype, "userName", void 0);
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
], OrderFact.prototype, "finalPrice", void 0);
__decorate([
    Index(),
    Column({ type: "timestamp" }),
    __metadata("design:type", Date)
], OrderFact.prototype, "createdAt", void 0);
__decorate([
    Column({ type: "varchar", default: "pending" }),
    __metadata("design:type", String)
], OrderFact.prototype, "status", void 0);
OrderFact = __decorate([
    Entity("order_facts")
], OrderFact);
export { OrderFact };
//# sourceMappingURL=order-fact.entity.js.map