import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { Order } from "../entities/order.entity.ts";
import { DeliveryType } from "../constants/delivery-type.constant.ts";
import { PaymentMethod } from "../constants/payment-method.constant.ts";
import { OrderStatus } from "../constants/order-status.constant.ts";
import { OrderItemResponseDto } from "./order-item-response.dto.ts";
import { UserResponseDto } from "../../users/dto/user-response.dto.ts";
import { PromocodeResponseDto } from "../../promocodes/dto/promocode-response.dto.ts";

export class OrderResponseDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "The unique identifier of the order",
  })
  id: string;

  @ApiPropertyOptional({
    type: UserResponseDto,
    description: "User details, if available",
    nullable: true,
  })
  user?: UserResponseDto | null;

  @ApiPropertyOptional({
    type: PromocodeResponseDto,
    description: "Promocode details, if applied",
    nullable: true,
  })
  promocode?: PromocodeResponseDto | null;

  @ApiPropertyOptional({
    example: "PIZZA20",
    description: "Code string applied at checkout",
    nullable: true,
  })
  codeApplied: string | null;

  @ApiProperty({
    example: "123 Main St, Springfield",
    description: "Delivery address",
  })
  address: string;

  @ApiProperty({
    enum: DeliveryType,
    example: DeliveryType.DELIVERY,
    description: "Delivery type ('delivery' | 'pickup')",
  })
  delivery: DeliveryType;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CARD_ONLINE,
    description: "Payment method ('card_online' | 'card_on_delivery' | 'cash')",
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    example: 49.99,
    description: "Total price before discount",
  })
  totalPrice: number;

  @ApiPropertyOptional({
    example: 10.0,
    description: "Discount amount",
    nullable: true,
  })
  discountAmount: number | null;

  @ApiProperty({
    example: 39.99,
    description: "Final price charged after discount",
  })
  finalPrice: number;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    description:
      "Order status ('pending' | 'confirmed' | 'preparing' | 'ready_for_delivery' | 'delivering' | 'completed' | 'cancelled')",
  })
  status: OrderStatus;

  @ApiPropertyOptional({
    example: "Please ring the doorbell twice",
    description: "Optional comment or instructions",
    nullable: true,
  })
  comment: string | null;

  @ApiProperty({
    type: [OrderItemResponseDto],
    description: "Items in the order",
  })
  orderItems: OrderItemResponseDto[];

  @ApiProperty({
    example: "2026-09-01T12:00:00.000Z",
    description: "Order creation timestamp",
  })
  createdAt: Date;

  @ApiProperty({
    example: "2026-09-01T12:00:00.000Z",
    description: "Order update timestamp",
  })
  updatedAt: Date;

  static fromEntity(order: Order): OrderResponseDto {
    const dto = new OrderResponseDto();
    dto.id = order.id;
    dto.user = order.user ? UserResponseDto.fromEntity(order.user) : null;
    dto.promocode = order.promocode ? PromocodeResponseDto.fromEntity(order.promocode) : null;
    dto.codeApplied = order.codeApplied ?? null;
    dto.address = order.address;
    dto.delivery = order.delivery;
    dto.paymentMethod = order.paymentMethod;
    dto.totalPrice = Number(order.totalPrice);
    dto.discountAmount =
      order.discountAmount !== null && order.discountAmount !== undefined
        ? Number(order.discountAmount)
        : 0;
    dto.finalPrice = Number(order.finalPrice);
    dto.status = order.status;
    dto.comment = order.comment ?? null;
    dto.orderItems = (order.orderItems ?? []).map((item) => OrderItemResponseDto.fromEntity(item));
    dto.createdAt = order.createdAt;
    dto.updatedAt = order.updatedAt;
    return dto;
  }
}
