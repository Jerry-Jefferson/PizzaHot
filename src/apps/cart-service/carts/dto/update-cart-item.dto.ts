import { ApiProperty } from "@nestjs/swagger";

export class UpdateCartItemDto {
  @ApiProperty({
    example: 3,
    description: "New quantity for the cart item",
  })
  quantity: number;
}
