import { ApiProperty } from "@nestjs/swagger";

export class UpdateIngredientDto {
  @ApiProperty({ example: "Cheese", description: "Name of the ingredient" })
  name: string;
}
