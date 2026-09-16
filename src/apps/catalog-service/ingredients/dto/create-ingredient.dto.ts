import { ApiProperty } from "@nestjs/swagger";

export class CreateIngredientDto {
  @ApiProperty({ example: "Cheese", description: "Name of the ingredient" })
  name: string;
}
