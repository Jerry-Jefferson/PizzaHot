import { DeliveryType, type OrderItem, OrderStatus } from "@/types/order.types";
import {
  DELIVERY_PROGRESS_STEPS,
  FINAL_ORDER_STATUSES,
  ORDER_STATUSES,
  ORDER_SUMMARY_VISIBLE_ITEMS,
  PICKUP_PROGRESS_STEPS,
  type ProgressStep,
  type ProgressStepState,
} from "@/utils/constants/order.constants";

export function summarizeOrderItems(
  items: Pick<OrderItem, "pizzaName" | "quantity">[],
  visibleItems = ORDER_SUMMARY_VISIBLE_ITEMS
): string {
  const summary = items
    .slice(0, visibleItems)
    .map((item) => `${item.pizzaName} ×${String(item.quantity)}`)
    .join(", ");
  const hiddenCount = items.length - visibleItems;
  return hiddenCount > 0 ? `${summary} +${String(hiddenCount)} more` : summary;
}

export function isFinalOrderStatus(status: OrderStatus): boolean {
  return FINAL_ORDER_STATUSES.has(status);
}

export function getProgressSteps(delivery: DeliveryType): readonly ProgressStep[] {
  return delivery === DeliveryType.DELIVERY ? DELIVERY_PROGRESS_STEPS : PICKUP_PROGRESS_STEPS;
}

export function getStepState(step: ProgressStep, status: OrderStatus): ProgressStepState {
  if (status === OrderStatus.PENDING || status === OrderStatus.CANCELLED) {
    return "upcoming";
  }
  if (status === OrderStatus.COMPLETED) {
    return "done";
  }
  const stepRank = ORDER_STATUSES.indexOf(step.status);
  const statusRank = ORDER_STATUSES.indexOf(status);
  if (stepRank < statusRank) {
    return "done";
  }
  return stepRank === statusRank ? "current" : "upcoming";
}
