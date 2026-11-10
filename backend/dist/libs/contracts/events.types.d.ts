export interface UserRegisteredEvent {
    userId: string;
    email: string;
    name: string | null;
    verificationToken: string;
}
export interface UserEmailVerifiedEvent {
    userId: string;
    email: string;
}
export interface UserDeletedEvent {
    userId: string;
    email: string;
    name: string | null;
}
export interface PizzaUpsertedEvent {
    pizzaId: string;
    name: string;
    price: number;
    image: string | null;
    isAvailable: boolean;
}
export interface PizzaDeletedEvent {
    pizzaId: string;
}
export interface PromocodeDeletedEvent {
    promocodeId: string;
}
export interface OrderCreatedItem {
    pizzaId: string | null;
    pizzaName: string;
    priceAtPurchase: number;
    quantity: number;
}
export interface OrderCreatedEvent {
    orderId: string;
    userId: string;
    userEmail: string | null;
    promocodeId: string | null;
    totalPrice: number;
    discountAmount: number;
    finalPrice: number;
    items: OrderCreatedItem[];
    createdAt: string;
}
export interface OrderFailedEvent {
    orderId: string;
    userId: string;
    promocodeId: string | null;
    reason: string;
}
export interface OrderStatusChangedEvent {
    orderId: string;
    userId: string;
    previousStatus: string;
    status: string;
}
export interface CriticalErrorEvent {
    message: string;
    errorType: string;
    path?: string;
    statusCode?: number;
    method?: string;
    timestamp: string;
}
export interface LogWrittenEvent {
    level: string;
    message: string;
    context?: string;
    trace?: string;
    service: string;
    correlationId?: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
}
