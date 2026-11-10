import { DeepPartial, Repository } from "typeorm";
import { Cart } from "./cart.entity.ts";
import type { ICartRepository } from "./cart.types.ts";
export declare class CartRepository implements ICartRepository {
    private readonly repository;
    constructor(repository: Repository<Cart>);
    create(data: DeepPartial<Cart>): Cart;
    save(cart: Cart): Promise<Cart>;
    findByUserId(userId: string): Promise<Cart | null>;
    findOrCreate(userId: string): Promise<Cart>;
    remove(id: string): Promise<boolean>;
    clearPromocode(promocodeId: string): Promise<number>;
}
