import type { OrderItem } from "@/types/order.types";

export const ORDER_SUMMARY_VISIBLE_ITEMS = 3;

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
