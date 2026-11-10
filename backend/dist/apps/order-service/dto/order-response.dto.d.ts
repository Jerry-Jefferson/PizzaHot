import type { Order } from "../order.entity.ts";
import { DeliveryType } from "../constants/delivery-type.constant.ts";
import { PaymentMethod } from "../constants/payment-method.constant.ts";
import { OrderStatus } from "../constants/order-status.constant.ts";
import { OrderItemResponseDto } from "../order-items/order-item-response.dto.ts";
export declare class OrderResponseDto {
    id: string;
    userId: string | null;
    promocodeId: string | null;
    codeApplied: string | null;
    address: string;
    delivery: DeliveryType;
    paymentMethod: PaymentMethod;
    totalPrice: number;
    discountAmount: number | null;
    finalPrice: number;
    status: OrderStatus;
    comment: string | null;
    orderItems: OrderItemResponseDto[];
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(order: Order): OrderResponseDto;
    static fromEntities(orders: Order[]): OrderResponseDto[];
}
