import type { Pizza } from "./pizza.types";
import type { Promocode } from "./promocode.types";

export type CartPizza = Pick<Pizza, "id" | "name" | "price" | "image">;

export interface CartItem {
  id: string;
  pizza: CartPizza | null;
  quantity: number;
}

export type CartPromocode = Pick<
  Promocode,
  "id" | "code" | "discount" | "discountMode" | "validTill"
>;

export interface Cart {
  id: string;
  cartItems: CartItem[];
  promocode: CartPromocode | null;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  createdAt: string;
  updatedAt: string;
}
