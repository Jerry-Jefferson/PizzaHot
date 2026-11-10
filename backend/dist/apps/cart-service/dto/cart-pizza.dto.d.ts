import type { PizzaSnapshot } from "../snapshots/pizza-snapshot.entity.ts";
export declare class CartPizzaDto {
    id: string;
    name: string;
    price: number;
    image: string | null;
    static fromSnapshot(snapshot: PizzaSnapshot): CartPizzaDto;
}
