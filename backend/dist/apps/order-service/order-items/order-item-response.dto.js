var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
export class OrderItemResponseDto {
    id;
    pizzaName;
    priceAtPurchase;
    quantity;
    subtotal;
    pizzaId;
    static fromEntity(item) {
        const dto = new OrderItemResponseDto();
        dto.id = item.id;
        dto.pizzaName = item.pizzaName;
        dto.priceAtPurchase = Number(item.priceAtPurchase);
        dto.quantity = item.quantity;
        dto.subtotal = Number((Number(item.priceAtPurchase) * item.quantity).toFixed(2));
        dto.pizzaId = item.pizzaId;
        return dto;
    }
}
__decorate([
    ApiProperty({
        example: "123e4567-e89b-12d3-a456-426614174000",
        description: "The unique identifier of the order item",
    }),
    __metadata("design:type", String)
], OrderItemResponseDto.prototype, "id", void 0);
__decorate([
    ApiProperty({
        example: "Margherita",
        description: "Pizza name snapshotted at purchase",
    }),
    __metadata("design:type", String)
], OrderItemResponseDto.prototype, "pizzaName", void 0);
__decorate([
    ApiProperty({
        example: 9.99,
        description: "Unit price at purchase",
    }),
    __metadata("design:type", Number)
], OrderItemResponseDto.prototype, "priceAtPurchase", void 0);
__decorate([
    ApiProperty({
        example: 2,
        description: "Quantity purchased",
    }),
    __metadata("design:type", Number)
], OrderItemResponseDto.prototype, "quantity", void 0);
__decorate([
    ApiProperty({
        example: 19.98,
        description: "Subtotal for this item",
    }),
    __metadata("design:type", Number)
], OrderItemResponseDto.prototype, "subtotal", void 0);
__decorate([
    ApiPropertyOptional({
        example: "123e4567-e89b-12d3-a456-426614174000",
        description: "Catalog id at purchase time; null once that pizza is removed",
        nullable: true,
    }),
    __metadata("design:type", String)
], OrderItemResponseDto.prototype, "pizzaId", void 0);
//# sourceMappingURL=order-item-response.dto.js.map