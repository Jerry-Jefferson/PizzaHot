import { OrderStatus } from "../constants/order-status.constant.ts";
import { DeliveryType } from "../constants/delivery-type.constant.ts";
import { PaymentMethod } from "../constants/payment-method.constant.ts";
import type { ListOrdersQuery } from "../order.types.ts";
export declare class ListOrdersQueryDto implements Partial<ListOrdersQuery> {
    page?: number;
    limit?: number;
    userId?: string;
    status?: OrderStatus;
    delivery?: DeliveryType;
    paymentMethod?: PaymentMethod;
}
