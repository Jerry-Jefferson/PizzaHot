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
import { CartPizzaDto } from "../../dto/cart-pizza.dto.js";
export class CartItemResponseDto {
    id;
    pizza;
    quantity;
    static fromEntity(cartItem) {
        const dto = new CartItemResponseDto();
        dto.id = cartItem.id;
        dto.pizza = cartItem.pizza ? CartPizzaDto.fromSnapshot(cartItem.pizza) : null;
        dto.quantity = cartItem.quantity;
        return dto;
    }
}
__decorate([
    ApiProperty({
        example: "123e4567-e89b-12d3-a456-426614174000",
        description: "The unique identifier of the cart item",
    }),
    __metadata("design:type", String)
], CartItemResponseDto.prototype, "id", void 0);
__decorate([
    ApiProperty({
        type: CartPizzaDto,
        description: "Pizza details",
    }),
    __metadata("design:type", CartPizzaDto)
], CartItemResponseDto.prototype, "pizza", void 0);
__decorate([
    ApiProperty({
        example: 2,
        description: "Quantity of the pizza in the cart",
    }),
    __metadata("design:type", Number)
], CartItemResponseDto.prototype, "quantity", void 0);
//# sourceMappingURL=cart-item-response.dto.js.map