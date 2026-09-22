import { ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus } from "../constants/order-status.constant.ts";
import { DeliveryType } from "../constants/delivery-type.constant.ts";
import { PaymentMethod } from "../constants/payment-method.constant.ts";
import type { ListOrdersQuery } from "../order.types.ts";

export class ListOrdersQueryDto implements Partial<ListOrdersQuery> {
  @ApiPropertyOptional({ type: Number, example: 1, minimum: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ type: Number, example: 10, minimum: 1, maximum: 100, default: 10 })
  limit?: number;

  @ApiPropertyOptional({ type: String, format: "uuid", description: "Show orders of one user" })
  userId?: string;

  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.PENDING })
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: DeliveryType, example: DeliveryType.DELIVERY })
  delivery?: DeliveryType;

  @ApiPropertyOptional({ enum: PaymentMethod, example: PaymentMethod.CASH })
  paymentMethod?: PaymentMethod;
}
