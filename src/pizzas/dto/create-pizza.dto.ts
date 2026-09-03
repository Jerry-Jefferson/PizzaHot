import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePizzaDto {
  @ApiProperty({ example: "Margherita", description: "The name of the pizza" })
  name: string;

  @ApiProperty({
    example: "Classic delight with 100% real mozzarella cheese",
    description: "Pizza description",
  })
  description: string;

  @ApiPropertyOptional({
    example: "https://example.com/pizza.jpg",
    description: "URL of the pizza image",
  })
  image?: string | null;

  @ApiProperty({ example: 9.99, description: "The price of the pizza" })
  price: number;

  @ApiPropertyOptional({
    example: ["123e4567-e89b-12d3-a456-426614174000"],
    description: "Array of ingredient UUIDs",
    type: [String],
  })
  ingredientIds?: string[];
}
