export declare const PaymentMethod: {
    readonly CARD_ONLINE: "card_online";
    readonly CARD_ON_DELIVERY: "card_on_delivery";
    readonly CASH: "cash";
};
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
export declare const PAYMENT_METHODS: readonly ["card_online", "card_on_delivery", "cash"];
export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];
