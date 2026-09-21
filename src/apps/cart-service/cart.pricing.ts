import { calculatePrice } from "../../libs/price-calculation/price-calculation.ts";
import type {
  PriceCalculationResult,
  PriceableItem,
} from "../../libs/price-calculation/price-calculation.types.ts";
import type { DiscountMode } from "../../libs/contracts/index.ts";

export function priceCart(cart: {
  cartItems?: { quantity: number; pizza?: { price: number } | null }[] | null;
  promocodeDiscount: number | null;
  promocodeDiscountMode: DiscountMode | null;
  promocodeValidTill: Date | null;
}): PriceCalculationResult {
  const items: PriceableItem[] = (cart.cartItems ?? []).map((item) => ({
    price: Number(item.pizza?.price ?? 0),
    quantity: item.quantity,
  }));

  return calculatePrice(items, {
    discount: cart.promocodeDiscount,
    discountMode: cart.promocodeDiscountMode,
    validTill: cart.promocodeValidTill,
  });
}
