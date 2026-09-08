import { ApiProperty } from "@nestjs/swagger";
import type { CartItem } from "../entities/cart-item.entity.ts";
import { PizzaResponseDto } from "../../pizzas/dto/pizza-response.dto.ts";

export class CartItemResponseDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "The unique identifier of the cart item",
  })
  id: string;

  @ApiProperty({
    type: PizzaResponseDto,
    description: "Pizza details",
  })
  pizza: PizzaResponseDto;

  @ApiProperty({
    example: 2,
    description: "Quantity of the pizza in the cart",
  })
  quantity: number;

  static fromEntity(cartItem: CartItem): CartItemResponseDto {
    const dto = new CartItemResponseDto();
    dto.id = cartItem.id;
    dto.pizza = cartItem.pizza ? PizzaResponseDto.fromEntity(cartItem.pizza) : null;
    dto.quantity = cartItem.quantity;
    return dto;
  }
}
