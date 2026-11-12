import type { PaginationQuery } from "./api.types";

export const OrderStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY_FOR_DELIVERY: "ready_for_delivery",
  DELIVERING: "delivering",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const DeliveryType = {
  DELIVERY: "delivery",
  PICKUP: "pickup",
} as const;

export type DeliveryType = (typeof DeliveryType)[keyof typeof DeliveryType];

export const PaymentMethod = {
  CARD_ONLINE: "card_online",
  CARD_ON_DELIVERY: "card_on_delivery",
  CASH: "cash",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface OrderItem {
  id: string;
  pizzaId: string | null;
  pizzaName: string;
  priceAtPurchase: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
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
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  delivery: DeliveryType;
  paymentMethod: PaymentMethod;
  address?: string;
  comment?: string | null;
}

export interface OrderSearchQuery extends PaginationQuery {
  userId?: string;
  status?: OrderStatus;
  delivery?: DeliveryType;
  paymentMethod?: PaymentMethod;
}

export interface CheckoutFormValues {
  delivery: DeliveryType;
  paymentMethod: PaymentMethod | "";
  address: string;
  comment: string;
}

export type CheckoutField = keyof CheckoutFormValues;

export type CheckoutErrors = Partial<Record<CheckoutField, string>>;
