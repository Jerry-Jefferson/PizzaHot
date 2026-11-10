import { DiscountMode } from "../../../libs/contracts/index.ts";
export declare class UpdatePromocodeDto {
    code: string;
    discount: number;
    validTill: Date;
    discountMode: DiscountMode;
}
