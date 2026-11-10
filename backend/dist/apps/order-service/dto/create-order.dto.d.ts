import { DeliveryType } from "../constants/delivery-type.constant.ts";
import { PaymentMethod } from "../constants/payment-method.constant.ts";
export declare class CreateOrderDto {
    address?: string;
    delivery: DeliveryType;
    paymentMethod: PaymentMethod;
    comment?: string | null;
}
