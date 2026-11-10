import { type Relation } from "typeorm";
import type { OrderItem } from "./order-items/order-item.entity.ts";
import { DeliveryType } from "./constants/delivery-type.constant.ts";
import { PaymentMethod } from "./constants/payment-method.constant.ts";
import { OrderStatus } from "./constants/order-status.constant.ts";
export declare class Order {
    id: string;
    userId: string | null;
    promocodeId: string | null;
    address: string;
    delivery: DeliveryType;
    paymentMethod: PaymentMethod;
    totalPrice: number;
    discountAmount: number | null;
    finalPrice: number;
    status: OrderStatus;
    comment: string | null;
    codeApplied: string | null;
    orderItems: Relation<OrderItem[]>;
    createdAt: Date;
    updatedAt: Date;
}
