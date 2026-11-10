var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus } from "../constants/order-status.constant.js";
import { DeliveryType } from "../constants/delivery-type.constant.js";
import { PaymentMethod } from "../constants/payment-method.constant.js";
export class ListOrdersQueryDto {
    page;
    limit;
    userId;
    status;
    delivery;
    paymentMethod;
}
__decorate([
    ApiPropertyOptional({ type: Number, example: 1, minimum: 1, default: 1 }),
    __metadata("design:type", Number)
], ListOrdersQueryDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({ type: Number, example: 10, minimum: 1, maximum: 100, default: 10 }),
    __metadata("design:type", Number)
], ListOrdersQueryDto.prototype, "limit", void 0);
__decorate([
    ApiPropertyOptional({ type: String, format: "uuid", description: "Show orders of one user" }),
    __metadata("design:type", String)
], ListOrdersQueryDto.prototype, "userId", void 0);
__decorate([
    ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.PENDING }),
    __metadata("design:type", String)
], ListOrdersQueryDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ enum: DeliveryType, example: DeliveryType.DELIVERY }),
    __metadata("design:type", String)
], ListOrdersQueryDto.prototype, "delivery", void 0);
__decorate([
    ApiPropertyOptional({ enum: PaymentMethod, example: PaymentMethod.CASH }),
    __metadata("design:type", String)
], ListOrdersQueryDto.prototype, "paymentMethod", void 0);
//# sourceMappingURL=list-orders-query.dto.js.map