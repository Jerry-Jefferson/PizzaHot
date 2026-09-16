import { ApiProperty } from "@nestjs/swagger";

export class ApplyPromocodeDto {
  @ApiProperty({
    example: "PIZZA20",
    description: "The promocode to apply to the cart",
  })
  code: string;
}
