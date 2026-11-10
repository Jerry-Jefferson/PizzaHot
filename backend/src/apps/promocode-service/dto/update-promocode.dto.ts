import { ApiProperty } from "@nestjs/swagger";
import { DiscountMode } from "../../../libs/contracts/index.ts";

export class UpdatePromocodeDto {
  @ApiProperty({ example: "PIZZA30", description: "Unique promocode string" })
  code: string;

  @ApiProperty({
    example: 30,
    description: "Discount value (percentage e.g. 30 for 30%, or fixed amount e.g. 10 for $10)",
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
    enum: DiscountMode,
    example: DiscountMode.PERCENTAGE,
    description: "Type of discount: percentage or fixed_amount",
  })
  discountMode: DiscountMode;
}
