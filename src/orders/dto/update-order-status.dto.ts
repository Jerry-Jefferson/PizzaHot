import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "../constants/order-status.constant.ts";

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
    description:
      "New status for the order ('pending' | 'confirmed' | 'preparing' | 'ready_for_delivery' | 'delivering' | 'completed' | 'cancelled')",
  })
  status: OrderStatus;
}
