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
export class CartPizzaDto {
    id;
    name;
    price;
    image;
    static fromSnapshot(snapshot) {
        const dto = new CartPizzaDto();
        dto.id = snapshot.id;
        dto.name = snapshot.name;
        dto.price = Number(snapshot.price);
        dto.image = snapshot.image;
        return dto;
    }
}
__decorate([
    ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    __metadata("design:type", String)
], CartPizzaDto.prototype, "id", void 0);
__decorate([
    ApiProperty({ example: "Margherita" }),
    __metadata("design:type", String)
], CartPizzaDto.prototype, "name", void 0);
__decorate([
    ApiProperty({ example: 12.5 }),
    __metadata("design:type", Number)
], CartPizzaDto.prototype, "price", void 0);
__decorate([
    ApiProperty({ example: "/uploads/pizzas/abc.png", nullable: true }),
    __metadata("design:type", String)
], CartPizzaDto.prototype, "image", void 0);
//# sourceMappingURL=cart-pizza.dto.js.map