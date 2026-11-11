import { PaymentMethod } from "@/types/order.types";

interface PaymentMethodMeta {
  label: string;
  icon: string;
}

export const PAYMENT_METHOD_META: Record<PaymentMethod, PaymentMethodMeta> = {
  [PaymentMethod.CARD_ONLINE]: { label: "Card online", icon: "pi pi-credit-card" },
  [PaymentMethod.CARD_ON_DELIVERY]: { label: "Card on delivery", icon: "pi pi-wallet" },
  [PaymentMethod.CASH]: { label: "Cash", icon: "pi pi-money-bill" },
};

export const PAYMENT_METHODS = Object.values(PaymentMethod);
