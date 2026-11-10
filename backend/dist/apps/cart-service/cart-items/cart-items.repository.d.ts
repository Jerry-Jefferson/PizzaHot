import { DeepPartial, Repository } from "typeorm";
import { CartItem } from "./cart-item.entity.ts";
import type { ICartItemsRepository } from "../cart.types.ts";
export declare class CartItemsRepository implements ICartItemsRepository {
    private readonly repository;
    constructor(repository: Repository<CartItem>);
    create(data: DeepPartial<CartItem>): CartItem;
    save(cartItem: CartItem): Promise<CartItem>;
    findByCartAndPizza(cartId: string, pizzaId: string): Promise<CartItem | null>;
    removeByCartAndPizza(cartId: string, pizzaId: string): Promise<boolean>;
    removeAllByCartId(cartId: string): Promise<void>;
}
