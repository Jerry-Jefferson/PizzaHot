import type { Cart } from "../entities/cart.entity.ts";
import type { CartItem } from "../entities/cart-item.entity.ts";
import type { PizzaSnapshot } from "../../snapshots/entities/pizza-snapshot.entity.ts";
import type { User } from "../../../identity-service/users/entities/user.entity.ts";
import type { Promocode } from "../../../promocode-service/promocodes/entities/promocode.entity.ts";
import type { CartResponseDto } from "../dto/cart-response.dto.ts";
import { DiscountType } from "../../../promocode-service/promocodes/constants/discount-type.constant.ts";
import type { JwtPayload } from "../../../../libs/auth/jwt-payload.interface.ts";
import { Role } from "../../../../libs/common/constants/role.enum.ts";

export const mockUserId = "user-uuid-123";
export const mockPizzaId = "pizza-uuid-456";
export const mockCartId = "cart-uuid-789";
export const mockCartItemId = "item-uuid-001";

export const mockUser: JwtPayload = {
  sub: mockUserId,
  email: "test@example.com",
  role: Role.USER,
  isEmailVerified: true,
};

export const mockUserEntity: User = {
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

export const mockPizza: PizzaSnapshot = {
  id: mockPizzaId,
  name: "Margherita",
  price: 9.99,
  image: null,
  isAvailable: true,
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

export const createMockPizza = (overrides?: Partial<PizzaSnapshot>): PizzaSnapshot => ({
  ...mockPizza,
  ...overrides,
});

export const mockCart: Cart = {
  id: mockCartId,
  userId: mockUserId,
  cartItems: [],
  promocodeId: null,
  promocodeCode: null,
  promocodeDiscount: null,
  promocodeDiscountType: null,
  promocodeValidTill: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

export const createMockCart = (overrides?: Partial<Cart>): Cart => ({
  ...mockCart,
  ...overrides,
});

export const mockCartItem: CartItem = {
  id: mockCartItemId,
  cart: mockCart,
  pizza: mockPizza,
  quantity: 2,
};

export const createMockCartItem = (overrides?: Partial<CartItem>): CartItem => ({
  ...mockCartItem,
  ...overrides,
});

export const mockPromocodePercentage: Promocode = {
  id: "promo-uuid-1",
  code: "PIZZA20",
  discount: 20,
  validTill: new Date("2030-01-01T00:00:00.000Z"),
  discountType: DiscountType.PERCENTAGE,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  deletedAt: null,
};

export const mockPromocodeFixed: Promocode = {
  id: "promo-uuid-2",
  code: "FIXED10",
  discount: 10,
  validTill: new Date("2030-01-01T00:00:00.000Z"),
  discountType: DiscountType.FIXED_AMOUNT,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  deletedAt: null,
};

export const mockPromocodeExpired: Promocode = {
  id: "promo-uuid-3",
  code: "EXPIRED",
  discount: 15,
  validTill: new Date("2020-01-01T00:00:00.000Z"),
  discountType: DiscountType.PERCENTAGE,
  createdAt: new Date("2020-01-01T00:00:00.000Z"),
  updatedAt: new Date("2020-01-01T00:00:00.000Z"),
  deletedAt: null,
};

export const mockCartResponse: CartResponseDto = {
  id: mockCartId,
  cartItems: [],
  promocode: null,
  totalPrice: 0,
  discountAmount: 0,
  finalPrice: 0,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};
