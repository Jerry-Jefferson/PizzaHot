export declare const OrderStatus: {
    readonly PENDING: "pending";
    readonly CONFIRMED: "confirmed";
    readonly PREPARING: "preparing";
    readonly READY_FOR_DELIVERY: "ready_for_delivery";
    readonly DELIVERING: "delivering";
    readonly COMPLETED: "completed";
    readonly CANCELLED: "cancelled";
};
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export declare const ORDER_STATUSES: readonly ["pending", "confirmed", "preparing", "ready_for_delivery", "delivering", "completed", "cancelled"];
export type OrderStatusValue = (typeof ORDER_STATUSES)[number];
