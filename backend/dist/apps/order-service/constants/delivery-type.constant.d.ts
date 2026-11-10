export declare const DeliveryType: {
    readonly DELIVERY: "delivery";
    readonly PICKUP: "pickup";
};
export type DeliveryType = (typeof DeliveryType)[keyof typeof DeliveryType];
export declare const DELIVERY_TYPES: readonly ["delivery", "pickup"];
export type DeliveryTypeValue = (typeof DELIVERY_TYPES)[number];
