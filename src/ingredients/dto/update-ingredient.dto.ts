import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateIngredientDto {
  @ApiPropertyOptional({ example: "Cheese", description: "Name of the ingredient" })
  name?: string;

  @ApiPropertyOptional({ example: 1, description: "Price of the ingredient" })
  price?: number;
}
