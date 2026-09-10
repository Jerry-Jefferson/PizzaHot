export enum DeliveryType {
  DELIVERY = "delivery",
  PICKUP = "pickup",
}

export const DELIVERY_TYPES = [DeliveryType.DELIVERY, DeliveryType.PICKUP] as const;

export type DeliveryTypeValue = (typeof DELIVERY_TYPES)[number];
