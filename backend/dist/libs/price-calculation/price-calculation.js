import { DiscountMode } from "../contracts/index.js";
export function calculateTotalPrice(items) {
    const rawTotal = items.reduce((sum, item) => {
        const price = Number(item.price ?? 0);
        const quantity = Number(item.quantity ?? 0);
        return sum + price * quantity;
    }, 0);
    return Math.round(rawTotal * 100) / 100;
}
export function calculateDiscount(promocode, totalPrice) {
    if (!promocode?.discountMode || promocode.discount === null) {
        return 0;
    }
    if (promocode.validTill && new Date(promocode.validTill) < new Date()) {
        return 0;
    }
    if (promocode.discountMode === DiscountMode.PERCENTAGE) {
        const rawDiscount = (totalPrice * Number(promocode.discount)) / 100;
        return Math.round(rawDiscount * 100) / 100;
    }
    if (promocode.discountMode === DiscountMode.FIXED_AMOUNT) {
        return Math.min(totalPrice, Math.round(Number(promocode.discount) * 100) / 100);
    }
    return 0;
}
export function calculatePrice(items, promocode) {
    const totalPrice = calculateTotalPrice(items);
    const discountAmount = calculateDiscount(promocode, totalPrice);
    const finalPrice = Math.max(0, Math.round((totalPrice - discountAmount) * 100) / 100);
    return { totalPrice, discountAmount, finalPrice };
}
export function priceCart(cart) {
    const items = (cart.cartItems ?? []).map((item) => ({
        price: Number(item.pizza?.price ?? 0),
        quantity: item.quantity,
    }));
    return calculatePrice(items, {
        discount: cart.promocodeDiscount,
        discountMode: cart.promocodeDiscountMode,
        validTill: cart.promocodeValidTill,
    });
}
//# sourceMappingURL=price-calculation.js.map