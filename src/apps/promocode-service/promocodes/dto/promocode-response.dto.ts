import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Promocode } from "../entities/promocode.entity.ts";
import { DiscountType } from "../constants/discount-type.constant.ts";

export class PromocodeResponseDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "The unique identifier of the promocode",
  })
  id: string;

  @ApiProperty({
    example: "PIZZA20",
    description: "The unique promocode code",
  })
  code: string;

  @ApiProperty({
    example: 20,
    description: "The discount value",
  })
  discount: number;

  @ApiProperty({
    example: "2026-12-31T23:59:59.000Z",
    description: "Expiration date and time of the promocode",
  })
  validTill: Date;

  @ApiProperty({
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    description: "Type of discount: percentage or fixed_amount",
  })
  discountType: DiscountType;

  @ApiProperty({
    example: "2026-09-01T12:00:00.000Z",
    description: "The date the promocode was created",
  })
  createdAt: Date;

  @ApiProperty({
    example: "2026-09-01T12:00:00.000Z",
    description: "The date the promocode was last updated",
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    example: null,
    description: "The date the promocode was soft-deleted, if applicable",
  })
  deletedAt?: Date | null;

  static fromEntity(promocode: Promocode): PromocodeResponseDto {
    const dto = new PromocodeResponseDto();
    dto.id = promocode.id;
    dto.code = promocode.code;
    dto.discount = promocode.discount;
    dto.validTill = promocode.validTill;
    dto.discountType = promocode.discountType;
    dto.createdAt = promocode.createdAt;
    dto.updatedAt = promocode.updatedAt;
    dto.deletedAt = promocode.deletedAt ?? null;
    return dto;
  }
}
