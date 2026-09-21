import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { EVENTS, RPC } from "../../libs/contracts/index.ts";
import type {
  OrderCreatedEvent,
  PizzaDeletedEvent,
  PizzaUpsertedEvent,
  PromocodeDeletedEvent,
  UserDeletedEvent,
  CheckoutSnapshot,
} from "../../libs/contracts/index.ts";
import { ack } from "../../libs/messaging/ack.ts";
import { CartItemResponseDto } from "./cart-items/dto/cart-item-response.dto.ts";
import { CartService } from "./carts.service.ts";
import { PizzaSnapshotRepository } from "./snapshots/pizza-snapshot.repository.ts";
import type { CartResponseDto } from "./dto/cart-response.dto.ts";

@Controller()
export class CartMessagesController {
  private readonly logger = new Logger(CartMessagesController.name);

  constructor(
    private readonly cart: CartService,
    private readonly snapshots: PizzaSnapshotRepository
  ) {}

  @MessagePattern(RPC.cart.get)
  get(@Payload() payload: { userId: string }): Promise<CartResponseDto> {
    return this.cart.getCart(payload.userId);
  }

  @MessagePattern(RPC.cart.addItem)
  addItem(
    @Payload() payload: { userId: string; pizzaId: string; quantity: number }
  ): Promise<CartItemResponseDto> {
    return this.cart.addItem(payload.userId, payload.pizzaId, payload.quantity);
  }

  @MessagePattern(RPC.cart.updateItemQuantity)
  updateItemQuantity(
    @Payload() payload: { userId: string; pizzaId: string; quantity: number }
  ): Promise<CartItemResponseDto | null> {
    return this.cart.updateItemQuantity(payload.userId, payload.pizzaId, payload.quantity);
  }

  @MessagePattern(RPC.cart.removeItem)
  async removeItem(@Payload() payload: { userId: string; pizzaId: string }): Promise<{ ok: true }> {
    await this.cart.removeItem(payload.userId, payload.pizzaId);
    return { ok: true };
  }

  @MessagePattern(RPC.cart.clear)
  async clear(@Payload() payload: { userId: string }): Promise<{ ok: true }> {
    await this.cart.clearCart(payload.userId);
    return { ok: true };
  }

  @MessagePattern(RPC.cart.applyPromocode)
  applyPromocode(@Payload() payload: { userId: string; code: string }): Promise<CartResponseDto> {
    return this.cart.applyPromocode(payload.userId, payload.code);
  }

  @MessagePattern(RPC.cart.removePromocode)
  removePromocode(@Payload() payload: { userId: string }): Promise<CartResponseDto> {
    return this.cart.removePromocode(payload.userId);
  }

  @MessagePattern(RPC.cart.checkoutSnapshot)
  async checkoutSnapshot(@Payload() payload: { userId: string }): Promise<CheckoutSnapshot> {
    const cart = await this.cart.getCartEntity(payload.userId);

    if (!cart) {
      return { cartId: "", promocodeId: null, items: [] };
    }

    return {
      cartId: cart.id,
      promocodeId: cart.promocodeId,
      items: (cart.cartItems ?? []).map((item) => ({
        pizzaId: item.pizza.id,
        quantity: item.quantity,
      })),
    };
  }

  @EventPattern(EVENTS.pizzaCreated)
  async onPizzaCreated(
    @Payload() event: PizzaUpsertedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.pizzaCreated, () => this.upsertSnapshot(event));
  }

  @EventPattern(EVENTS.pizzaUpdated)
  async onPizzaUpdated(
    @Payload() event: PizzaUpsertedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.pizzaUpdated, () => this.upsertSnapshot(event));
  }

  @EventPattern(EVENTS.pizzaDeleted)
  async onPizzaDeleted(
    @Payload() event: PizzaDeletedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.pizzaDeleted, async () => {
      await this.snapshots.remove(event.pizzaId);
    });
  }

  @EventPattern(EVENTS.userDeleted)
  async onUserDeleted(
    @Payload() event: UserDeletedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.userDeleted, () =>
      this.cart.deleteForUser(event.userId)
    );
  }

  @EventPattern(EVENTS.promocodeDeleted)
  async onPromocodeDeleted(
    @Payload() event: PromocodeDeletedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.promocodeDeleted, () =>
      this.cart.detachPromocodeEverywhere(event.promocodeId)
    );
  }

  @EventPattern(EVENTS.orderCreated)
  async onOrderCreated(
    @Payload() event: OrderCreatedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.orderCreated, () =>
      this.cart.clearForOrder(event.userId)
    );
  }

  private async upsertSnapshot(event: PizzaUpsertedEvent): Promise<void> {
    await this.snapshots.upsert({
      id: event.pizzaId,
      name: event.name,
      price: event.price,
      image: event.image,
      isAvailable: event.isAvailable,
    });
  }
}
