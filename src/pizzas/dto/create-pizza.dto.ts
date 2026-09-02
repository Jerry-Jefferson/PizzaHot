import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PizzaDto {
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
}
