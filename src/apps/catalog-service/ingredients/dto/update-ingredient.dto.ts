import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateIngredientDto {
  @ApiPropertyOptional({ example: "Cheese", description: "Name of the ingredient" })
  name?: string;
}
