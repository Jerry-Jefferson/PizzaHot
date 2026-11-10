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
export class UpdatePizzaDto {
    name;
    description;
    price;
    ingredientIds;
}
__decorate([
    ApiProperty({ example: "Margherita", description: "The name of the pizza" }),
    __metadata("design:type", String)
], UpdatePizzaDto.prototype, "name", void 0);
__decorate([
    ApiProperty({
        example: "Classic delight with 100% real mozzarella cheese",
        description: "Pizza description",
    }),
    __metadata("design:type", String)
], UpdatePizzaDto.prototype, "description", void 0);
__decorate([
    ApiProperty({ example: 9.99, description: "The price of the pizza" }),
    __metadata("design:type", Number)
], UpdatePizzaDto.prototype, "price", void 0);
__decorate([
    ApiProperty({
        example: ["123e4567-e89b-12d3-a456-426614174000"],
        description: "The ingredients this pizza has after the request. An empty list clears them.",
        type: [String],
        default: [],
    }),
    __metadata("design:type", Array)
], UpdatePizzaDto.prototype, "ingredientIds", void 0);
//# sourceMappingURL=update-pizza.dto.js.map