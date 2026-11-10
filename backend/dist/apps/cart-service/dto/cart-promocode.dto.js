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
export class CartPromocodeDto {
    id;
    code;
    discount;
    discountMode;
    validTill;
    static fromCart(cart) {
        if (!cart.promocodeId ||
            !cart.promocodeCode ||
            cart.promocodeDiscount === null ||
            cart.promocodeDiscountMode === null ||
            cart.promocodeValidTill === null) {
            return null;
        }
        const dto = new CartPromocodeDto();
        dto.id = cart.promocodeId;
        dto.code = cart.promocodeCode;
        dto.discount = Number(cart.promocodeDiscount);
        dto.discountMode = cart.promocodeDiscountMode;
        dto.validTill = cart.promocodeValidTill;
        return dto;
    }
}
__decorate([
    ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    __metadata("design:type", String)
], CartPromocodeDto.prototype, "id", void 0);
__decorate([
    ApiProperty({ example: "WELCOME10" }),
    __metadata("design:type", String)
], CartPromocodeDto.prototype, "code", void 0);
__decorate([
    ApiProperty({ example: 10 }),
    __metadata("design:type", Number)
], CartPromocodeDto.prototype, "discount", void 0);
__decorate([
    ApiProperty({ example: "percentage" }),
    __metadata("design:type", String)
], CartPromocodeDto.prototype, "discountMode", void 0);
__decorate([
    ApiProperty({ example: "2026-12-31T00:00:00.000Z" }),
    __metadata("design:type", Date)
], CartPromocodeDto.prototype, "validTill", void 0);
//# sourceMappingURL=cart-promocode.dto.js.map