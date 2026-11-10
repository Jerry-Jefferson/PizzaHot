import { type Relation } from "typeorm";
import type { PizzaSnapshot } from "../snapshots/pizza-snapshot.entity.ts";
import type { Cart } from "../cart.entity.ts";
export declare class CartItem {
    id: string;
    cart: Relation<Cart>;
    pizza: Relation<PizzaSnapshot>;
    quantity: number;
}
