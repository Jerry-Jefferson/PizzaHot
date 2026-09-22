import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DeliveryType } from "../constants/delivery-type.constant.ts";
import { PaymentMethod } from "../constants/payment-method.constant.ts";

export class CreateOrderDto {
  @ApiPropertyOptional({
    example: "123 Main St, Springfield",
    description: "Delivery address (required if delivery type is 'delivery')",
  })
  address?: string;

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

  @ApiPropertyOptional({
    example: "Please call when you arrive",
    description: "Optional order comments or instructions",
  })
  comment?: string | null;
}
