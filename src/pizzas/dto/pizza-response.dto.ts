import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Pizza } from "../entities/pizza.entity.ts";

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
    example: "https://example.com/pizza.jpg",
    description: "URL of the pizza image",
  })
  image?: string | null;

  @ApiProperty({ example: 9.99, description: "The price of the pizza" })
  price: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(pizza: Pizza): PizzaResponseDto {
    const dto = new PizzaResponseDto();
    dto.id = pizza.id;
    dto.name = pizza.name;
    dto.description = pizza.description;
    dto.image = pizza.image;
    dto.price = pizza.price;
    dto.createdAt = pizza.createdAt;
    dto.updatedAt = pizza.updatedAt;
    return dto;
  }
}
