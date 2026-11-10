import { RedemptionStatus } from "./redemption-status.constant.ts";
export declare class PromocodeRedemption {
    id: string;
    userId: string;
    promocodeId: string;
    orderId: string | null;
    status: RedemptionStatus;
    createdAt: Date;
    updatedAt: Date;
}
