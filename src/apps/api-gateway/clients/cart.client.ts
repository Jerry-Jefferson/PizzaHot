import { Inject, Injectable } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { CART_CLIENT } from "../../../libs/messaging/tokens.ts";
import { RPC } from "../../../libs/contracts/patterns.ts";
import { rpc } from "../../../libs/messaging/rpc.util.ts";
import type { CartResponseDto } from "../../cart-service/carts/dto/cart-response.dto.ts";
import type { CartItem } from "../../cart-service/carts/entities/cart-item.entity.ts";

@Injectable()
export class CartClient {
  constructor(@Inject(CART_CLIENT) private readonly client: ClientProxy) {}

  getCart(userId: string): Promise<CartResponseDto> {
    return rpc(this.client, RPC.cart.get, { userId });
  }

  addItem(userId: string, pizzaId: string, quantity: number): Promise<CartItem> {
    return rpc(this.client, RPC.cart.addItem, { userId, pizzaId, quantity });
  }

  updateItemQuantity(userId: string, pizzaId: string, quantity: number): Promise<CartItem | null> {
    return rpc(this.client, RPC.cart.updateItemQuantity, { userId, pizzaId, quantity });
  }

  removeItem(userId: string, pizzaId: string): Promise<{ ok: true }> {
    return rpc(this.client, RPC.cart.removeItem, { userId, pizzaId });
  }

  clearCart(userId: string): Promise<{ ok: true }> {
    return rpc(this.client, RPC.cart.clear, { userId });
  }

  applyPromocode(userId: string, code: string): Promise<CartResponseDto> {
    return rpc(this.client, RPC.cart.applyPromocode, { userId, code });
  }

  removePromocode(userId: string): Promise<CartResponseDto> {
    return rpc(this.client, RPC.cart.removePromocode, { userId });
  }
}
