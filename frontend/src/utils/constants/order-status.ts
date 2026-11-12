import { OrderStatus } from "@/types/order.types";
import type { StatusTone } from "@/types/ui.types";

interface OrderStatusMeta {
  label: string;
  tone: StatusTone;
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

const FINAL_ORDER_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
]);

export function isFinalOrderStatus(status: OrderStatus): boolean {
  return FINAL_ORDER_STATUSES.has(status);
}
