import { ApiProperty } from "@nestjs/swagger";
import type { Cart } from "../cart.entity.ts";
import type { DiscountMode } from "../../../libs/contracts/index.ts";

export class CartPromocodeDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id: string;

  @ApiProperty({ example: "WELCOME10" })
  code: string;

  @ApiProperty({ example: 10 })
  discount: number;

  @ApiProperty({ example: "percentage" })
  discountMode: DiscountMode;

  @ApiProperty({ example: "2026-12-31T00:00:00.000Z" })
  validTill: Date;

  static fromCart(cart: Cart): CartPromocodeDto | null {
    if (
      !cart.promocodeId ||
      !cart.promocodeCode ||
      cart.promocodeDiscount === null ||
      cart.promocodeDiscountMode === null ||
      cart.promocodeValidTill === null
    ) {
      return null;
    }

    const dto = new CartPromocodeDto();
    dto.id = cart.promocodeId;
    dto.code = cart.promocodeCode;
    dto.discount = Number(cart.promocodeDiscount);
    dto.discountMode = cart.promocodeDiscountMode;
    dto.validTill = cart.promocodeValidTill;
    return dto;
  }
}
