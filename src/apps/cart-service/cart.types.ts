import type { CartItem } from "./cart-items/cart-item.entity.ts";
import type { DeepPartial } from "../../libs/common/common.types.ts";
import type { Cart } from "./cart.entity.ts";

export interface ICartItemsRepository {
  create(data: DeepPartial<CartItem>): CartItem;
  save(cartItem: CartItem): Promise<CartItem>;
  findByCartAndPizza(cartId: string, pizzaId: string): Promise<CartItem | null>;
  removeByCartAndPizza(cartId: string, pizzaId: string): Promise<boolean>;
  removeAllByCartId(cartId: string): Promise<void>;
}

export interface ICartRepository {
  create(data: DeepPartial<Cart>): Cart;
  save(cart: Cart): Promise<Cart>;
  findByUserId(userId: string): Promise<Cart | null>;
  findOrCreate(userId: string): Promise<Cart>;
  remove(id: string): Promise<boolean>;
  clearPromocode(promocodeId: string): Promise<number>;
}
