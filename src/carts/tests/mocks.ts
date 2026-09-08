import type { Cart } from "../entities/cart.entity.ts";
import type { CartItem } from "../entities/cart-item.entity.ts";
import type { Pizza } from "../../pizzas/entities/pizza.entity.ts";
import type { User } from "../../users/entities/user.entity.ts";
import type { Promocode } from "../../promocodes/entities/promocode.entity.ts";
import type { CartResponseDto } from "../dto/cart-response.dto.ts";
import { DiscountType } from "../../promocodes/constants/discount-type.constant.ts";
import type { JwtPayload } from "../../auth/types/jwt-payload.interface.ts";
import { Role } from "../../shared/constants/role.enum.ts";

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
  name: "John",
  surname: "Doe",
  gender: null,
  image: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

export const mockPizza: Pizza = {
  id: mockPizzaId,
  name: "Margherita",
  description: "Tomato sauce, mozzarella, fresh basil",
  image: null,
  price: 9.99,
  pizzaIngredients: [],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

export const createMockPizza = (overrides?: Partial<Pizza>): Pizza => ({
  ...mockPizza,
  ...overrides,
});

export const mockCart: Cart = {
  id: mockCartId,
  user: mockUserEntity,
  cartItems: [],
  promocode: null,
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
  carts: [],
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
  carts: [],
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
  carts: [],
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
