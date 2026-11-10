import { DiscountMode } from "../../../libs/contracts/index.ts";
export declare class CreatePromocodeDto {
    code: string;
    discount: number;
    validTill: Date;
    discountMode: DiscountMode;
}
