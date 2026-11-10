import { ApiProperty } from "@nestjs/swagger";
import { Ingredient } from "../ingredient.entity.ts";

export class IngredientResponseDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "The unique identifier of the ingredient",
  })
  id: string;

  @ApiProperty({ example: "Cheese", description: "The name of the ingredient" })
  name: string;

  @ApiProperty({
    example: "2026-09-01T12:00:00.000Z",
    description: "The date the ingredient was created",
  })
  createdAt: Date;

  @ApiProperty({
    example: "2026-09-01T12:00:00.000Z",
    description: "The date the ingredient was last updated",
  })
  updatedAt: Date;

  static fromEntity(ingredient: Ingredient): IngredientResponseDto {
    const dto = new IngredientResponseDto();
    dto.id = ingredient.id;
    dto.name = ingredient.name;
    dto.createdAt = ingredient.createdAt;
    dto.updatedAt = ingredient.updatedAt;
    return dto;
  }

  static fromEntities(ingredients: Ingredient[]): IngredientResponseDto[] {
    return ingredients.map((ingredient) => IngredientResponseDto.fromEntity(ingredient));
  }
}
