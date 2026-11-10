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
import { DiscountMode } from "../../../libs/contracts/index.js";
export class PromocodeResponseDto {
    id;
    code;
    discount;
    validTill;
    discountMode;
    createdAt;
    updatedAt;
    deletedAt;
    static fromEntity(promocode) {
        const dto = new PromocodeResponseDto();
        dto.id = promocode.id;
        dto.code = promocode.code;
        dto.discount = promocode.discount;
        dto.validTill = promocode.validTill;
        dto.discountMode = promocode.discountMode;
        dto.createdAt = promocode.createdAt;
        dto.updatedAt = promocode.updatedAt;
        dto.deletedAt = promocode.deletedAt ?? null;
        return dto;
    }
    static fromEntities(promocodes) {
        return promocodes.map((promocode) => PromocodeResponseDto.fromEntity(promocode));
    }
}
__decorate([
    ApiProperty({
        example: "123e4567-e89b-12d3-a456-426614174000",
        description: "The unique identifier of the promocode",
    }),
    __metadata("design:type", String)
], PromocodeResponseDto.prototype, "id", void 0);
__decorate([
    ApiProperty({
        example: "PIZZA20",
        description: "The unique promocode code",
    }),
    __metadata("design:type", String)
], PromocodeResponseDto.prototype, "code", void 0);
__decorate([
    ApiProperty({
        example: 20,
        description: "The discount value",
    }),
    __metadata("design:type", Number)
], PromocodeResponseDto.prototype, "discount", void 0);
__decorate([
    ApiProperty({
        example: "2026-12-31T23:59:59.000Z",
        description: "Expiration date and time of the promocode",
    }),
    __metadata("design:type", Date)
], PromocodeResponseDto.prototype, "validTill", void 0);
__decorate([
    ApiProperty({
        enum: DiscountMode,
        example: DiscountMode.PERCENTAGE,
        description: "Type of discount: percentage or fixed_amount",
    }),
    __metadata("design:type", String)
], PromocodeResponseDto.prototype, "discountMode", void 0);
__decorate([
    ApiProperty({
        example: "2026-09-01T12:00:00.000Z",
        description: "The date the promocode was created",
    }),
    __metadata("design:type", Date)
], PromocodeResponseDto.prototype, "createdAt", void 0);
__decorate([
    ApiProperty({
        example: "2026-09-01T12:00:00.000Z",
        description: "The date the promocode was last updated",
    }),
    __metadata("design:type", Date)
], PromocodeResponseDto.prototype, "updatedAt", void 0);
__decorate([
    ApiPropertyOptional({
        example: null,
        description: "The date the promocode was soft-deleted, if applicable",
    }),
    __metadata("design:type", Date)
], PromocodeResponseDto.prototype, "deletedAt", void 0);
//# sourceMappingURL=promocode-response.dto.js.map