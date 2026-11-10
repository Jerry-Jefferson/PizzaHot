var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, Unique, } from "typeorm";
let CartItem = class CartItem {
    id;
    cart;
    pizza;
    quantity;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], CartItem.prototype, "id", void 0);
__decorate([
    ManyToOne("Cart", (cart) => cart.cartItems, { onDelete: "CASCADE" }),
    JoinColumn({ name: "cart_id" }),
    __metadata("design:type", Object)
], CartItem.prototype, "cart", void 0);
__decorate([
    ManyToOne("PizzaSnapshot", { onDelete: "CASCADE" }),
    JoinColumn({ name: "pizza_id" }),
    __metadata("design:type", Object)
], CartItem.prototype, "pizza", void 0);
__decorate([
    Column({ type: "int", default: 1 }),
    __metadata("design:type", Number)
], CartItem.prototype, "quantity", void 0);
CartItem = __decorate([
    Entity("cart_items"),
    Unique(["cart", "pizza"])
], CartItem);
export { CartItem };
//# sourceMappingURL=cart-item.entity.js.map