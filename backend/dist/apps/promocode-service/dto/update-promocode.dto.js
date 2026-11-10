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
import { DiscountMode } from "../../../libs/contracts/index.js";
export class UpdatePromocodeDto {
    code;
    discount;
    validTill;
    discountMode;
}
__decorate([
    ApiProperty({ example: "PIZZA30", description: "Unique promocode string" }),
    __metadata("design:type", String)
], UpdatePromocodeDto.prototype, "code", void 0);
__decorate([
    ApiProperty({
        example: 30,
        description: "Discount value (percentage e.g. 30 for 30%, or fixed amount e.g. 10 for $10)",
    }),
    __metadata("design:type", Number)
], UpdatePromocodeDto.prototype, "discount", void 0);
__decorate([
    ApiProperty({
        example: "2026-12-31T23:59:59.000Z",
        description: "Expiration date and time of the promocode",
        type: String,
        format: "date-time",
    }),
    __metadata("design:type", Date)
], UpdatePromocodeDto.prototype, "validTill", void 0);
__decorate([
    ApiProperty({
        enum: DiscountMode,
        example: DiscountMode.PERCENTAGE,
        description: "Type of discount: percentage or fixed_amount",
    }),
    __metadata("design:type", String)
], UpdatePromocodeDto.prototype, "discountMode", void 0);
//# sourceMappingURL=update-promocode.dto.js.map