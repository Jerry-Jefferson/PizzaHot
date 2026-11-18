import { DiscountMode, type Promocode, type PromocodeState } from "@/types/promocode.types";
import { formatWholePrice } from "@/utils/format";

export function getPromocodeState(
  promocode: Pick<Promocode, "deletedAt" | "validTill">,
  now: Date = new Date()
): PromocodeState {
  if (promocode.deletedAt) {
    return "inactive";
  }
  return new Date(promocode.validTill).getTime() < now.getTime() ? "expired" : "active";
}

export function formatDiscount(promocode: Pick<Promocode, "discount" | "discountMode">): string {
  return promocode.discountMode === DiscountMode.PERCENTAGE
    ? `${String(promocode.discount)}% off`
    : `${formatWholePrice(promocode.discount)} off`;
}

export function startOfTomorrow(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

export function toExpiryTimestamp(day: Date): string {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999).toISOString();
}

export function toExpiryDay(validTill: string): Date {
  const date = new Date(validTill);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
