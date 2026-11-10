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
import { DiscountMode } from "../../libs/contracts/index.js";
import { checkIn, checkName } from "../../libs/database/check-in.util.js";
let Cart = class Cart {
    id;
    userId;
    cartItems;
    promocodeId;
    promocodeCode;
    promocodeDiscount;
    promocodeDiscountMode;
    promocodeValidTill;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Cart.prototype, "id", void 0);
__decorate([
    Column({ type: "uuid", unique: true }),
    __metadata("design:type", String)
], Cart.prototype, "userId", void 0);
__decorate([
    OneToMany("CartItem", (cartItem) => cartItem.cart),
    __metadata("design:type", Object)
], Cart.prototype, "cartItems", void 0);
__decorate([
    Column({ type: "uuid", nullable: true, default: null }),
    __metadata("design:type", String)
], Cart.prototype, "promocodeId", void 0);
__decorate([
    Column({ type: "varchar", nullable: true, default: null }),
    __metadata("design:type", String)
], Cart.prototype, "promocodeCode", void 0);
__decorate([
    Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: true,
        default: null,
        transformer: {
            to: (value) => value,
            from: (value) => (value === null ? null : parseFloat(value)),
        },
    }),
    __metadata("design:type", Number)
], Cart.prototype, "promocodeDiscount", void 0);
__decorate([
    Column({ type: "varchar", length: 32, nullable: true, default: null }),
    __metadata("design:type", String)
], Cart.prototype, "promocodeDiscountMode", void 0);
__decorate([
    Column({ type: "timestamp", nullable: true, default: null }),
    __metadata("design:type", Date)
], Cart.prototype, "promocodeValidTill", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Cart.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Cart.prototype, "updatedAt", void 0);
Cart = __decorate([
    Entity("carts"),
    Check(checkName("carts", "promocodeDiscountMode"), checkIn("promocodeDiscountMode", Object.values(DiscountMode)))
], Cart);
export { Cart };
//# sourceMappingURL=cart.entity.js.map