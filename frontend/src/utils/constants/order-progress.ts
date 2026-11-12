import { DeliveryType, OrderStatus } from "@/types/order.types";

import { ORDER_STATUSES } from "./order-status";

export type ProgressStepState = "done" | "current" | "upcoming";

export interface ProgressStep {
  status: OrderStatus;
  label: string;
}

const DELIVERY_STEPS: readonly ProgressStep[] = [
  { status: OrderStatus.CONFIRMED, label: "Confirmed" },
  { status: OrderStatus.PREPARING, label: "Preparing" },
  { status: OrderStatus.READY_FOR_DELIVERY, label: "Ready" },
  { status: OrderStatus.DELIVERING, label: "Out for delivery" },
  { status: OrderStatus.COMPLETED, label: "Delivered" },
];

const PICKUP_STEPS: readonly ProgressStep[] = [
  { status: OrderStatus.CONFIRMED, label: "Confirmed" },
  { status: OrderStatus.PREPARING, label: "Preparing" },
  { status: OrderStatus.READY_FOR_DELIVERY, label: "Ready for pickup" },
  { status: OrderStatus.COMPLETED, label: "Picked up" },
];

export function getProgressSteps(delivery: DeliveryType): readonly ProgressStep[] {
  return delivery === DeliveryType.DELIVERY ? DELIVERY_STEPS : PICKUP_STEPS;
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
