import type { CartItem } from "../entities/cart-item.entity.ts";
import type { DeepPartial } from "../../shared/database/interfaces/common.interface.ts";

export interface ICartItemsRepository {
  create(data: DeepPartial<CartItem>): CartItem;
  save(cartItem: CartItem): Promise<CartItem>;
  findByCartAndPizza(cartId: string, pizzaId: string): Promise<CartItem | null>;
  removeByCartAndPizza(cartId: string, pizzaId: string): Promise<boolean>;
  removeAllByCartId(cartId: string): Promise<void>;
}
