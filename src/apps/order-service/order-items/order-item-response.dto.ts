import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { OrderItem } from "./order-item.entity.ts";

export class OrderItemResponseDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "The unique identifier of the order item",
  })
  id: string;

  @ApiProperty({
    example: "Margherita",
    description: "Pizza name snapshotted at purchase",
  })
  pizzaName: string;

  @ApiProperty({
    example: 9.99,
    description: "Unit price at purchase",
  })
  priceAtPurchase: number;

  @ApiProperty({
    example: 2,
    description: "Quantity purchased",
  })
  quantity: number;

  @ApiProperty({
    example: 19.98,
    description: "Subtotal for this item",
  })
  subtotal: number;

  @ApiPropertyOptional({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "Catalog id at purchase time; null once that pizza is removed",
    nullable: true,
  })
  pizzaId: string | null;

  static fromEntity(item: OrderItem): OrderItemResponseDto {
    const dto = new OrderItemResponseDto();
    dto.id = item.id;
    dto.pizzaName = item.pizzaName;
    dto.priceAtPurchase = Number(item.priceAtPurchase);
    dto.quantity = item.quantity;
    dto.subtotal = Number((Number(item.priceAtPurchase) * item.quantity).toFixed(2));
    dto.pizzaId = item.pizzaId;
    return dto;
  }
}
