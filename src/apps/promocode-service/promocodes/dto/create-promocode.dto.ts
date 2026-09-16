import { ApiProperty } from "@nestjs/swagger";
import { DiscountType } from "../constants/discount-type.constant.ts";

export class CreatePromocodeDto {
  @ApiProperty({
    example: "PIZZA20",
    description: "Unique promocode string",
  })
  code: string;

  @ApiProperty({
    example: 20,
    description: "Discount value (percentage e.g. 20 for 20%, or fixed amount e.g. 5 for $5)",
  })
  discount: number;

  @ApiProperty({
    example: "2026-12-31T23:59:59.000Z",
    description: "Expiration date and time of the promocode",
    type: String,
    format: "date-time",
  })
  validTill: Date;

  @ApiProperty({
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    description: "Type of discount: percentage or fixed_amount",
  })
  discountType: DiscountType;
}
