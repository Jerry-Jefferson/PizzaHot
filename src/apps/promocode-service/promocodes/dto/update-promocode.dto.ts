import { ApiPropertyOptional } from "@nestjs/swagger";
import { DiscountType } from "../constants/discount-type.constant.ts";

export class UpdatePromocodeDto {
  @ApiPropertyOptional({
    example: "PIZZA30",
    description: "Unique promocode string",
  })
  code?: string;

  @ApiPropertyOptional({
    example: 30,
    description: "Discount value (percentage e.g. 30 for 30%, or fixed amount e.g. 10 for $10)",
  })
  discount?: number;

  @ApiPropertyOptional({
    example: "2026-12-31T23:59:59.000Z",
    description: "Expiration date and time of the promocode",
    type: String,
    format: "date-time",
  })
  validTill?: Date;

  @ApiPropertyOptional({
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    description: "Type of discount: percentage or fixed_amount",
  })
  discountType?: DiscountType;
}
