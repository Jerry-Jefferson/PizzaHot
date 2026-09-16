import { DiscountType } from "../../promocode-service/promocodes/constants/discount-type.constant.ts";

export interface PricingResult {
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

export interface PriceableItem {
  price: number;
  quantity: number;
}

export interface PriceablePromocode {
  discount: number | null;
  discountType: DiscountType | null;
  validTill: Date | null;
}

export function calculateTotalPrice(items: PriceableItem[]): number {
  const rawTotal = items.reduce((sum, item) => {
    const price = Number(item.price ?? 0);
    const quantity = Number(item.quantity ?? 0);

    return sum + price * quantity;
  }, 0);

  return Math.round(rawTotal * 100) / 100;
}

export function calculateDiscount(
  promocode: PriceablePromocode | null,
  totalPrice: number
): number {
  if (!promocode?.discountType || promocode.discount === null) {
    return 0;
  }

  if (promocode.validTill && new Date(promocode.validTill) < new Date()) {
    return 0;
  }

  if (promocode.discountType === DiscountType.PERCENTAGE) {
    const rawDiscount = (totalPrice * Number(promocode.discount)) / 100;

    return Math.round(rawDiscount * 100) / 100;
  }

  if (promocode.discountType === DiscountType.FIXED_AMOUNT) {
    return Math.min(totalPrice, Math.round(Number(promocode.discount) * 100) / 100);
  }

  return 0;
}

export function calculatePricing(
  items: PriceableItem[],
  promocode: PriceablePromocode | null
): PricingResult {
  const totalPrice = calculateTotalPrice(items);
  const discountAmount = calculateDiscount(promocode, totalPrice);
  const finalPrice = Math.max(0, Math.round((totalPrice - discountAmount) * 100) / 100);

  return { totalPrice, discountAmount, finalPrice };
}

export function priceCart(cart: {
  cartItems?: { quantity: number; pizza?: { price: number } | null }[] | null;
  promocodeDiscount: number | null;
  promocodeDiscountType: DiscountType | null;
  promocodeValidTill: Date | null;
}): PricingResult {
  const items: PriceableItem[] = (cart.cartItems ?? []).map((item) => ({
    price: Number(item.pizza?.price ?? 0),
    quantity: item.quantity,
  }));

  return calculatePricing(items, {
    discount: cart.promocodeDiscount,
    discountType: cart.promocodeDiscountType,
    validTill: cart.promocodeValidTill,
  });
}
