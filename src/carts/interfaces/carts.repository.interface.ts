import type { Cart } from "../entities/cart.entity.ts";
import type { DeepPartial } from "../../shared/database/interfaces/common.interface.ts";

export interface ICartRepository {
  create(data: DeepPartial<Cart>): Cart;
  save(cart: Cart): Promise<Cart>;
  findByUserId(userId: string): Promise<Cart | null>;
  findOrCreate(userId: string): Promise<Cart>;
  remove(id: string): Promise<boolean>;
}
