import { DiscountMode } from "../../libs/contracts/index.ts";
export declare class Promocode {
    id: string;
    code: string;
    discount: number;
    validTill: Date;
    discountMode: DiscountMode;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
