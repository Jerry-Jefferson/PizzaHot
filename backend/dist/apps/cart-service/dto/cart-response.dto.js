var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from "@nestjs/swagger";
import { CartPromocodeDto } from "./cart-promocode.dto.js";
import { CartItemResponseDto } from "../cart-items/dto/cart-item-response.dto.js";
export class CartResponseDto {
    id;
    cartItems;
    promocode;
    totalPrice;
    discountAmount;
    finalPrice;
    createdAt;
    updatedAt;
    static fromEntity(cart, pricing) {
        const dto = new CartResponseDto();
        dto.id = cart.id;
        dto.cartItems = (cart.cartItems ?? []).map((item) => CartItemResponseDto.fromEntity(item));
        dto.promocode = CartPromocodeDto.fromCart(cart);
        dto.totalPrice = pricing.totalPrice;
        dto.discountAmount = pricing.discountAmount;
        dto.finalPrice = pricing.finalPrice;
        dto.createdAt = cart.createdAt;
        dto.updatedAt = cart.updatedAt;
        return dto;
    }
}
__decorate([
    ApiProperty({
        example: "123e4567-e89b-12d3-a456-426614174000",
        description: "The unique identifier of the cart",
    }),
    __metadata("design:type", String)
], CartResponseDto.prototype, "id", void 0);
__decorate([
    ApiProperty({
        type: [CartItemResponseDto],
        description: "Items in the cart",
    }),
    __metadata("design:type", Array)
], CartResponseDto.prototype, "cartItems", void 0);
__decorate([
    ApiProperty({
        nullable: true,
        type: CartPromocodeDto,
        description: "Applied promocode, if any",
    }),
    __metadata("design:type", CartPromocodeDto)
], CartResponseDto.prototype, "promocode", void 0);
__decorate([
    ApiProperty({
        example: 49.99,
        description: "Full price without discount",
    }),
    __metadata("design:type", Number)
], CartResponseDto.prototype, "totalPrice", void 0);
__decorate([
    ApiProperty({
        example: 10.0,
        description: "Discount amount",
    }),
    __metadata("design:type", Number)
], CartResponseDto.prototype, "discountAmount", void 0);
__decorate([
    ApiProperty({
        example: 39.99,
        description: "Final price after discount",
    }),
    __metadata("design:type", Number)
], CartResponseDto.prototype, "finalPrice", void 0);
__decorate([
    ApiProperty({
        example: "2026-09-01T12:00:00.000Z",
        description: "The date the cart was created",
    }),
    __metadata("design:type", Date)
], CartResponseDto.prototype, "createdAt", void 0);
__decorate([
    ApiProperty({
        example: "2026-09-01T12:00:00.000Z",
        description: "The date the cart was last updated",
    }),
    __metadata("design:type", Date)
], CartResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=cart-response.dto.js.map