var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Check, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, } from "typeorm";
import { DeliveryType } from "./constants/delivery-type.constant.js";
import { PaymentMethod } from "./constants/payment-method.constant.js";
import { OrderStatus } from "./constants/order-status.constant.js";
import { checkIn, checkName } from "../../libs/database/check-in.util.js";
let Order = class Order {
    id;
    userId;
    promocodeId;
    address;
    delivery;
    paymentMethod;
    totalPrice;
    discountAmount;
    finalPrice;
    status;
    comment;
    codeApplied;
    orderItems;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);
__decorate([
    Column({ type: "uuid", name: "user_id", nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "userId", void 0);
__decorate([
    Column({ type: "uuid", name: "promocode_id", nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "promocodeId", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], Order.prototype, "address", void 0);
__decorate([
    Column({ type: "varchar", length: 32 }),
    __metadata("design:type", String)
], Order.prototype, "delivery", void 0);
__decorate([
    Column({ type: "varchar", length: 32 }),
    __metadata("design:type", String)
], Order.prototype, "paymentMethod", void 0);
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
], Order.prototype, "totalPrice", void 0);
__decorate([
    Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        default: 0,
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null ? parseFloat(value) : 0),
        },
    }),
    __metadata("design:type", Number)
], Order.prototype, "discountAmount", void 0);
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
], Order.prototype, "finalPrice", void 0);
__decorate([
    Column({ type: "varchar", length: 32, default: OrderStatus.PENDING }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    Column({ type: "text", nullable: true, default: null }),
    __metadata("design:type", String)
], Order.prototype, "comment", void 0);
__decorate([
    Column({ type: "varchar", nullable: true, default: null }),
    __metadata("design:type", String)
], Order.prototype, "codeApplied", void 0);
__decorate([
    OneToMany("OrderItem", (orderItem) => orderItem.order, {
        cascade: true,
    }),
    __metadata("design:type", Object)
], Order.prototype, "orderItems", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
Order = __decorate([
    Entity("orders"),
    Check(checkName("orders", "delivery"), checkIn("delivery", Object.values(DeliveryType))),
    Check(checkName("orders", "paymentMethod"), checkIn("paymentMethod", Object.values(PaymentMethod))),
    Check(checkName("orders", "status"), checkIn("status", Object.values(OrderStatus)))
], Order);
export { Order };
//# sourceMappingURL=order.entity.js.map