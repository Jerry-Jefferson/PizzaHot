import { ApiProperty } from "@nestjs/swagger";
import { Ingredient } from "../entities/ingredient.entity.ts";

export class IngredientResponseDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "The unique identifier of the ingredient",
  })
  id: string;

  @ApiProperty({ example: "Cheese", description: "The name of the ingredient" })
  name: string;

  @ApiProperty({ example: 1.5, description: "The price of the ingredient" })
  price: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(ingredient: Ingredient): IngredientResponseDto {
    const dto = new IngredientResponseDto();
    dto.id = ingredient.id;
    dto.name = ingredient.name;
    dto.price = ingredient.price;
    dto.createdAt = ingredient.createdAt;
    dto.updatedAt = ingredient.updatedAt;
    return dto;
  }
}
