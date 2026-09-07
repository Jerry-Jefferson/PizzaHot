import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AddCartItemDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "UUID of the pizza to add",
  })
  pizzaId: string;

  @ApiPropertyOptional({
    example: 1,
    description: "Quantity to add (defaults to 1)",
    default: 1,
  })
  quantity?: number;
}
