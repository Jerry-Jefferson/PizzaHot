import { DiscountMode } from "../../../libs/contracts/index.js";
import { Role } from "../../../libs/auth/auth.constant.js";
export const mockUserId = "user-uuid-123";
export const mockPizzaId = "pizza-uuid-456";
export const mockCartId = "cart-uuid-789";
export const mockCartItemId = "item-uuid-001";
export const mockUser = {
    sub: mockUserId,
    email: "test@example.com",
    role: Role.USER,
    isEmailVerified: true,
};
export const mockUserEntity = {
    id: mockUserId,
    email: "test@example.com",
    role: Role.USER,
    passwordHash: "hashed-password",
    isEmailVerified: true,
    verificationToken: null,
    verificationTokenExpiresAt: null,
    name: "John",
    surname: "Doe",
    gender: null,
    image: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};
export const mockPizza = {
    id: mockPizzaId,
    name: "Margherita",
    price: 9.99,
    image: null,
    isAvailable: true,
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};
export const createMockPizza = (overrides) => ({
    ...mockPizza,
    ...overrides,
});
export const mockCart = {
    id: mockCartId,
    userId: mockUserId,
    cartItems: [],
    promocodeId: null,
    promocodeCode: null,
    promocodeDiscount: null,
    promocodeDiscountMode: null,
    promocodeValidTill: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};
export const createMockCart = (overrides) => ({
    ...mockCart,
    ...overrides,
});
export const mockCartItem = {
    id: mockCartItemId,
    cart: mockCart,
    pizza: mockPizza,
    quantity: 2,
};
export const createMockCartItem = (overrides) => ({
    ...mockCartItem,
    ...overrides,
});
export const mockPromocodePercentage = {
    id: "promo-uuid-1",
    code: "PIZZA20",
    discount: 20,
    validTill: new Date("2030-01-01T00:00:00.000Z"),
    discountMode: DiscountMode.PERCENTAGE,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    deletedAt: null,
};
export const mockPromocodeFixed = {
    id: "promo-uuid-2",
    code: "FIXED10",
    discount: 10,
    validTill: new Date("2030-01-01T00:00:00.000Z"),
    discountMode: DiscountMode.FIXED_AMOUNT,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    deletedAt: null,
};
export const mockPromocodeExpired = {
    id: "promo-uuid-3",
    code: "EXPIRED",
    discount: 15,
    validTill: new Date("2020-01-01T00:00:00.000Z"),
    discountMode: DiscountMode.PERCENTAGE,
    createdAt: new Date("2020-01-01T00:00:00.000Z"),
    updatedAt: new Date("2020-01-01T00:00:00.000Z"),
    deletedAt: null,
};
export const mockCartResponse = {
    id: mockCartId,
    cartItems: [],
    promocode: null,
    totalPrice: 0,
    discountAmount: 0,
    finalPrice: 0,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};
//# sourceMappingURL=mocks.js.map