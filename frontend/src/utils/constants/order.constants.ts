import { OrderStatus, PaymentMethod } from "@/types/order.types";
import type { StatusTone } from "@/types/ui.types";

interface OrderStatusMeta {
  label: string;
  tone: StatusTone;
}

interface PaymentMethodMeta {
  label: string;
  icon: string;
}

export type ProgressStepState = "done" | "current" | "upcoming";

export interface ProgressStep {
  status: OrderStatus;
  label: string;
}

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  [OrderStatus.PENDING]: { label: "Pending", tone: "processing" },
  [OrderStatus.CONFIRMED]: { label: "Confirmed", tone: "info" },
  [OrderStatus.PREPARING]: { label: "Preparing", tone: "warning" },
  [OrderStatus.READY_FOR_DELIVERY]: { label: "Ready", tone: "warning" },
  [OrderStatus.DELIVERING]: { label: "Out for delivery", tone: "warning" },
  [OrderStatus.COMPLETED]: { label: "Completed", tone: "success" },
  [OrderStatus.CANCELLED]: { label: "Cancelled", tone: "danger" },
};

export const ORDER_STATUSES = Object.values(OrderStatus);

export const ORDER_SUMMARY_VISIBLE_ITEMS = 3;

export const MY_ORDERS_PAGE_SIZE = 10;

export const RECENT_ORDERS_LIMIT = 5;

export const PENDING_ORDERS_REFETCH_MS = 60_000;

export const FINAL_ORDER_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
]);

export const DELIVERY_PROGRESS_STEPS: readonly ProgressStep[] = [
  { status: OrderStatus.CONFIRMED, label: "Confirmed" },
  { status: OrderStatus.PREPARING, label: "Preparing" },
  { status: OrderStatus.READY_FOR_DELIVERY, label: "Ready" },
  { status: OrderStatus.DELIVERING, label: "Out for delivery" },
  { status: OrderStatus.COMPLETED, label: "Delivered" },
];

export const PICKUP_PROGRESS_STEPS: readonly ProgressStep[] = [
  { status: OrderStatus.CONFIRMED, label: "Confirmed" },
  { status: OrderStatus.PREPARING, label: "Preparing" },
  { status: OrderStatus.READY_FOR_DELIVERY, label: "Ready for pickup" },
  { status: OrderStatus.COMPLETED, label: "Picked up" },
];

export const PAYMENT_METHOD_META: Record<PaymentMethod, PaymentMethodMeta> = {
  [PaymentMethod.CARD_ONLINE]: { label: "Card online", icon: "pi pi-credit-card" },
  [PaymentMethod.CARD_ON_DELIVERY]: { label: "Card on delivery", icon: "pi pi-wallet" },
  [PaymentMethod.CASH]: { label: "Cash", icon: "pi pi-money-bill" },
};

export const PAYMENT_METHODS = Object.values(PaymentMethod);
