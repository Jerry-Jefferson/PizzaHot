import { ApiProperty } from "@nestjs/swagger";
import type { Cart } from "../entities/cart.entity.ts";
import { PromocodeResponseDto } from "../../promocodes/dto/promocode-response.dto.ts";
import { CartItemResponseDto } from "./cart-item-response.dto.ts";

export class CartResponseDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "The unique identifier of the cart",
  })
  id: string;

  @ApiProperty({
    type: [CartItemResponseDto],
    description: "Items in the cart",
  })
  cartItems: CartItemResponseDto[];

  @ApiProperty({
    nullable: true,
    type: PromocodeResponseDto,
    description: "Applied promocode, if any",
  })
  promocode: PromocodeResponseDto | null;

  @ApiProperty({
    example: 49.99,
    description: "Full price without discount",
  })
  totalPrice: number;

  @ApiProperty({
    example: 10.0,
    description: "Discount amount",
  })
  discountAmount: number;

  @ApiProperty({
    example: 39.99,
    description: "Final price after discount",
  })
  finalPrice: number;

  @ApiProperty({
    example: "2026-09-01T12:00:00.000Z",
    description: "The date the cart was created",
  })
  createdAt: Date;

  @ApiProperty({
    example: "2026-09-01T12:00:00.000Z",
    description: "The date the cart was last updated",
  })
  updatedAt: Date;

  static fromEntity(
    cart: Cart,
    pricing: {
      totalPrice: number;
      discountAmount: number;
      finalPrice: number;
    }
  ): CartResponseDto {
    const dto = new CartResponseDto();

    dto.id = cart.id;

    dto.cartItems = (cart.cartItems ?? []).map((item) => CartItemResponseDto.fromEntity(item));

    dto.promocode = cart.promocode ? PromocodeResponseDto.fromEntity(cart.promocode) : null;

    dto.totalPrice = pricing.totalPrice;
    dto.discountAmount = pricing.discountAmount;
    dto.finalPrice = pricing.finalPrice;

    dto.createdAt = cart.createdAt;
    dto.updatedAt = cart.updatedAt;

    return dto;
  }
}
