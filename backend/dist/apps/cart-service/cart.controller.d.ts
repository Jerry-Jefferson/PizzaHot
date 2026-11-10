import { RmqContext } from "@nestjs/microservices";
import type { OrderCreatedEvent, PizzaDeletedEvent, PizzaUpsertedEvent, PromocodeDeletedEvent, UserDeletedEvent, CheckoutSnapshot } from "../../libs/contracts/index.ts";
import { CartItemResponseDto } from "./cart-items/dto/cart-item-response.dto.ts";
import { CartService } from "./carts.service.ts";
import { PizzaSnapshotRepository } from "./snapshots/pizza-snapshot.repository.ts";
import type { CartResponseDto } from "./dto/cart-response.dto.ts";
export declare class CartMessagesController {
    private readonly cart;
    private readonly snapshots;
    private readonly logger;
    constructor(cart: CartService, snapshots: PizzaSnapshotRepository);
    get(payload: {
        userId: string;
    }): Promise<CartResponseDto>;
    addItem(payload: {
        userId: string;
        pizzaId: string;
        quantity: number;
    }): Promise<CartItemResponseDto>;
    updateItemQuantity(payload: {
        userId: string;
        pizzaId: string;
        quantity: number;
    }): Promise<CartItemResponseDto | null>;
    removeItem(payload: {
        userId: string;
        pizzaId: string;
    }): Promise<{
        ok: true;
    }>;
    clear(payload: {
        userId: string;
    }): Promise<{
        ok: true;
    }>;
    applyPromocode(payload: {
        userId: string;
        code: string;
    }): Promise<CartResponseDto>;
    removePromocode(payload: {
        userId: string;
    }): Promise<CartResponseDto>;
    checkoutSnapshot(payload: {
        userId: string;
    }): Promise<CheckoutSnapshot>;
    onPizzaCreated(event: PizzaUpsertedEvent, context: RmqContext): Promise<void>;
    onPizzaUpdated(event: PizzaUpsertedEvent, context: RmqContext): Promise<void>;
    onPizzaDeleted(event: PizzaDeletedEvent, context: RmqContext): Promise<void>;
    onUserDeleted(event: UserDeletedEvent, context: RmqContext): Promise<void>;
    onPromocodeDeleted(event: PromocodeDeletedEvent, context: RmqContext): Promise<void>;
    onOrderCreated(event: OrderCreatedEvent, context: RmqContext): Promise<void>;
    private upsertSnapshot;
}
