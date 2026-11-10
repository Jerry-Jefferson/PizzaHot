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
import { DeliveryType } from "../constants/delivery-type.constant.js";
import { PaymentMethod } from "../constants/payment-method.constant.js";
import { OrderStatus } from "../constants/order-status.constant.js";
import { OrderItemResponseDto } from "../order-items/order-item-response.dto.js";
export class OrderResponseDto {
    id;
    userId;
    promocodeId;
    codeApplied;
    address;
    delivery;
    paymentMethod;
    totalPrice;
    discountAmount;
    finalPrice;
    status;
    comment;
    orderItems;
    createdAt;
    updatedAt;
    static fromEntity(order) {
        const dto = new OrderResponseDto();
        dto.id = order.id;
        dto.userId = order.userId;
        dto.promocodeId = order.promocodeId;
        dto.codeApplied = order.codeApplied ?? null;
        dto.address = order.address;
        dto.delivery = order.delivery;
        dto.paymentMethod = order.paymentMethod;
        dto.totalPrice = Number(order.totalPrice);
        dto.discountAmount =
            order.discountAmount !== null && order.discountAmount !== undefined
                ? Number(order.discountAmount)
                : 0;
        dto.finalPrice = Number(order.finalPrice);
        dto.status = order.status;
        dto.comment = order.comment ?? null;
        dto.orderItems = (order.orderItems ?? []).map((item) => OrderItemResponseDto.fromEntity(item));
        dto.createdAt = order.createdAt;
        dto.updatedAt = order.updatedAt;
        return dto;
    }
    static fromEntities(orders) {
        return orders.map((order) => OrderResponseDto.fromEntity(order));
    }
}
__decorate([
    ApiProperty({
        example: "123e4567-e89b-12d3-a456-426614174000",
        description: "The unique identifier of the order",
    }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "id", void 0);
__decorate([
    ApiPropertyOptional({
        example: "123e4567-e89b-12d3-a456-426614174000",
        description: "Owner of the order; null once the account is deleted",
        nullable: true,
    }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "userId", void 0);
__decorate([
    ApiPropertyOptional({
        example: "123e4567-e89b-12d3-a456-426614174000",
        description: "Promocode applied at checkout; codeApplied holds the readable value",
        nullable: true,
    }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "promocodeId", void 0);
__decorate([
    ApiPropertyOptional({
        example: "PIZZA20",
        description: "Code string applied at checkout",
        nullable: true,
    }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "codeApplied", void 0);
__decorate([
    ApiProperty({
        example: "123 Main St, Springfield",
        description: "Delivery address",
    }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "address", void 0);
__decorate([
    ApiProperty({
        enum: DeliveryType,
        example: DeliveryType.DELIVERY,
        description: "Delivery type ('delivery' | 'pickup')",
    }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "delivery", void 0);
__decorate([
    ApiProperty({
        enum: PaymentMethod,
        example: PaymentMethod.CARD_ONLINE,
        description: "Payment method ('card_online' | 'card_on_delivery' | 'cash')",
    }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "paymentMethod", void 0);
__decorate([
    ApiProperty({
        example: 49.99,
        description: "Total price before discount",
    }),
    __metadata("design:type", Number)
], OrderResponseDto.prototype, "totalPrice", void 0);
__decorate([
    ApiPropertyOptional({
        example: 10.0,
        description: "Discount amount",
        nullable: true,
    }),
    __metadata("design:type", Number)
], OrderResponseDto.prototype, "discountAmount", void 0);
__decorate([
    ApiProperty({
        example: 39.99,
        description: "Final price charged after discount",
    }),
    __metadata("design:type", Number)
], OrderResponseDto.prototype, "finalPrice", void 0);
__decorate([
    ApiProperty({
        enum: OrderStatus,
        example: OrderStatus.PENDING,
        description: "Order status ('pending' | 'confirmed' | 'preparing' | 'ready_for_delivery' | 'delivering' | 'completed' | 'cancelled')",
    }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({
        example: "Please ring the doorbell twice",
        description: "Optional comment or instructions",
        nullable: true,
    }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "comment", void 0);
__decorate([
    ApiProperty({
        type: [OrderItemResponseDto],
        description: "Items in the order",
    }),
    __metadata("design:type", Array)
], OrderResponseDto.prototype, "orderItems", void 0);
__decorate([
    ApiProperty({
        example: "2026-09-01T12:00:00.000Z",
        description: "Order creation timestamp",
    }),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "createdAt", void 0);
__decorate([
    ApiProperty({
        example: "2026-09-01T12:00:00.000Z",
        description: "Order update timestamp",
    }),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=order-response.dto.js.map