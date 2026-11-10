export declare const RedemptionStatus: {
    readonly PENDING: "pending";
    readonly CONFIRMED: "confirmed";
};
export type RedemptionStatus = (typeof RedemptionStatus)[keyof typeof RedemptionStatus];
