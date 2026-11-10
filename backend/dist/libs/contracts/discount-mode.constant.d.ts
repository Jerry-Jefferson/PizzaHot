export declare const DiscountMode: {
    readonly PERCENTAGE: "percentage";
    readonly FIXED_AMOUNT: "fixed_amount";
};
export type DiscountMode = (typeof DiscountMode)[keyof typeof DiscountMode];
export declare const DISCOUNT_MODES: readonly ["percentage", "fixed_amount"];
export type DiscountValue = (typeof DISCOUNT_MODES)[number];
