import { type Relation } from "typeorm";
import { Order } from "../order.entity.ts";
export declare class OrderItem {
    id: string;
    order: Relation<Order>;
    pizzaId: string | null;
    pizzaName: string;
    priceAtPurchase: number;
    quantity: number;
}
