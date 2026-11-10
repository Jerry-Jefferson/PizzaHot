import type { OrderItem } from "./order-item.entity.ts";
export declare class OrderItemResponseDto {
    id: string;
    pizzaName: string;
    priceAtPurchase: number;
    quantity: number;
    subtotal: number;
    pizzaId: string | null;
    static fromEntity(item: OrderItem): OrderItemResponseDto;
}
