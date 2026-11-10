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
export class CreateOrderDto {
    address;
    delivery;
    paymentMethod;
    comment;
}
__decorate([
    ApiPropertyOptional({
        example: "123 Main St, Springfield",
        description: "Delivery address (required if delivery type is 'delivery')",
    }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "address", void 0);
__decorate([
    ApiProperty({
        enum: DeliveryType,
        example: DeliveryType.DELIVERY,
        description: "Delivery type ('delivery' | 'pickup')",
    }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "delivery", void 0);
__decorate([
    ApiProperty({
        enum: PaymentMethod,
        example: PaymentMethod.CARD_ONLINE,
        description: "Payment method ('card_online' | 'card_on_delivery' | 'cash')",
    }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "paymentMethod", void 0);
__decorate([
    ApiPropertyOptional({
        example: "Please call when you arrive",
        description: "Optional order comments or instructions",
    }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "comment", void 0);
//# sourceMappingURL=create-order.dto.js.map