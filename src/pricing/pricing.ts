import { Cart } from "../carts/entities/cart.entity.ts";
import { DiscountType } from "../promocodes/constants/discount-type.constant.ts";

export interface PricingResult {
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

export function calculateTotalPrice(cart: Cart): number {
  const rawTotal = (cart.cartItems ?? []).reduce((sum, item) => {
    const price = Number(item.pizza?.price ?? 0);
    const quantity = Number(item.quantity ?? 0);

    return sum + price * quantity;
  }, 0);

  return Math.round(rawTotal * 100) / 100;
}

export function calculateDiscount(cart: Cart, totalPrice: number): number {
  if (!cart.promocode) {
    return 0;
  }

  const isExpired = new Date(cart.promocode.validTill) < new Date();

  if (isExpired) {
    return 0;
  }

  if (cart.promocode.discountType === DiscountType.PERCENTAGE) {
    const rawDiscount = (totalPrice * Number(cart.promocode.discount)) / 100;

    return Math.round(rawDiscount * 100) / 100;
  }

  if (cart.promocode.discountType === DiscountType.FIXED_AMOUNT) {
    return Math.min(totalPrice, Math.round(Number(cart.promocode.discount) * 100) / 100);
  }

  return 0;
}

export function calculatePricing(cart: Cart): PricingResult {
  const totalPrice = calculateTotalPrice(cart);

  const discountAmount = calculateDiscount(cart, totalPrice);

  const finalPrice = Math.max(0, Math.round((totalPrice - discountAmount) * 100) / 100);

  return {
    totalPrice,
    discountAmount,
    finalPrice,
  };
}
