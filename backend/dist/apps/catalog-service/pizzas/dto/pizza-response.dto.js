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
import { IngredientResponseDto } from "../../ingredients/dto/ingredient-response.dto.js";
export class PizzaResponseDto {
    id;
    name;
    description;
    image;
    price;
    ingredients;
    createdAt;
    updatedAt;
    static fromEntity(pizza) {
        const dto = new PizzaResponseDto();
        dto.id = pizza.id;
        dto.name = pizza.name;
        dto.description = pizza.description;
        dto.image = pizza.image;
        dto.price = pizza.price;
        if (pizza.pizzaIngredients) {
            dto.ingredients = pizza.pizzaIngredients
                .map((pi) => (pi.ingredient ? IngredientResponseDto.fromEntity(pi.ingredient) : null))
                .filter(Boolean);
        }
        dto.createdAt = pizza.createdAt;
        dto.updatedAt = pizza.updatedAt;
        return dto;
    }
    static fromEntities(pizzas) {
        return pizzas.map((pizza) => PizzaResponseDto.fromEntity(pizza));
    }
}
__decorate([
    ApiProperty({
        example: "123e4567-e89b-12d3-a456-426614174000",
        description: "The unique identifier of the pizza",
    }),
    __metadata("design:type", String)
], PizzaResponseDto.prototype, "id", void 0);
__decorate([
    ApiProperty({ example: "Margherita", description: "The name of the pizza" }),
    __metadata("design:type", String)
], PizzaResponseDto.prototype, "name", void 0);
__decorate([
    ApiProperty({
        example: "Classic delight with 100% real mozzarella cheese",
        description: "Pizza description",
    }),
    __metadata("design:type", String)
], PizzaResponseDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional({
        example: "/uploads/pizzas/abc123.jpg",
        description: "Relative path to the pizza image file",
    }),
    __metadata("design:type", String)
], PizzaResponseDto.prototype, "image", void 0);
__decorate([
    ApiProperty({ example: 9.99, description: "The price of the pizza" }),
    __metadata("design:type", Number)
], PizzaResponseDto.prototype, "price", void 0);
__decorate([
    ApiPropertyOptional({
        type: [IngredientResponseDto],
        description: "List of ingredients on the pizza",
    }),
    __metadata("design:type", Array)
], PizzaResponseDto.prototype, "ingredients", void 0);
__decorate([
    ApiProperty({
        example: "2026-09-01T12:00:00.000Z",
        description: "The date the pizza was created",
    }),
    __metadata("design:type", Date)
], PizzaResponseDto.prototype, "createdAt", void 0);
__decorate([
    ApiProperty({
        example: "2026-09-01T12:00:00.000Z",
        description: "The date the pizza was last updated",
    }),
    __metadata("design:type", Date)
], PizzaResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=pizza-response.dto.js.map