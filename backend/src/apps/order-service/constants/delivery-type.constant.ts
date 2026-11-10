export const DeliveryType = {
  DELIVERY: "delivery",
  PICKUP: "pickup",
} as const;

export type DeliveryType = (typeof DeliveryType)[keyof typeof DeliveryType];

export const DELIVERY_TYPES = [DeliveryType.DELIVERY, DeliveryType.PICKUP] as const;

export type DeliveryTypeValue = (typeof DELIVERY_TYPES)[number];
