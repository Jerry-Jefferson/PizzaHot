export enum PaymentMethod {
  CARD_ONLINE = "card_online",
  CARD_ON_DELIVERY = "card_on_delivery",
  CASH = "cash",
}

export const PAYMENT_METHODS = [
  PaymentMethod.CARD_ONLINE,
  PaymentMethod.CARD_ON_DELIVERY,
  PaymentMethod.CASH,
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];
