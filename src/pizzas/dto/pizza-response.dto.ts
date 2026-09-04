import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Pizza } from "../entities/pizza.entity.ts";
import { IngredientResponseDto } from "../../ingredients/dto/ingredient-response.dto.ts";

export class PizzaResponseDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "The unique identifier of the pizza",
  })
  id: string;

  @ApiProperty({ example: "Margherita", description: "The name of the pizza" })
  name: string;

  @ApiProperty({
    example: "Classic delight with 100% real mozzarella cheese",
    description: "Pizza description",
  })
  description: string;

  @ApiPropertyOptional({
    example: "/uploads/pizzas/abc123.jpg",
    description: "Relative path to the pizza image file",
  })
  image?: string | null;

  @ApiProperty({ example: 9.99, description: "The price of the pizza" })
  price: number;

  @ApiPropertyOptional({
    type: [IngredientResponseDto],
    description: "List of ingredients on the pizza",
  })
  ingredients?: IngredientResponseDto[];

  @ApiProperty({
    example: "2026-09-01T12:00:00.000Z",
    description: "The date the pizza was created",
  })
  createdAt: Date;

  @ApiProperty({
    example: "2026-09-01T12:00:00.000Z",
    description: "The date the pizza was last updated",
  })
  updatedAt: Date;

  static fromEntity(pizza: Pizza): PizzaResponseDto {
    const dto = new PizzaResponseDto();
    dto.id = pizza.id;
    dto.name = pizza.name;
    dto.description = pizza.description;
    dto.image = pizza.image;
    dto.price = pizza.price;
    if (pizza.pizzaIngredients) {
      dto.ingredients = pizza.pizzaIngredients
        .map((pi) => (pi.ingredient ? IngredientResponseDto.fromEntity(pi.ingredient) : null))
        .filter(Boolean) as IngredientResponseDto[];
    }
    dto.createdAt = pizza.createdAt;
    dto.updatedAt = pizza.updatedAt;
    return dto;
  }
}
