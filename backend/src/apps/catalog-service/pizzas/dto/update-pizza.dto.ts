import { ApiProperty } from "@nestjs/swagger";

export class UpdatePizzaDto {
  @ApiProperty({ example: "Margherita", description: "The name of the pizza" })
  name: string;

  @ApiProperty({
    example: "Classic delight with 100% real mozzarella cheese",
    description: "Pizza description",
  })
  description: string;

  @ApiProperty({ example: 9.99, description: "The price of the pizza" })
  price: number;

  @ApiProperty({
    example: ["123e4567-e89b-12d3-a456-426614174000"],
    description: "The ingredients this pizza has after the request. An empty list clears them.",
    type: [String],
    default: [],
  })
  ingredientIds: string[];
}
