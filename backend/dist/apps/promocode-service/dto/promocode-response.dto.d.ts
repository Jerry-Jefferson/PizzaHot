import { Promocode } from "../promocode.entity.ts";
import { DiscountMode } from "../../../libs/contracts/index.ts";
export declare class PromocodeResponseDto {
    id: string;
    code: string;
    discount: number;
    validTill: Date;
    discountMode: DiscountMode;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    static fromEntity(promocode: Promocode): PromocodeResponseDto;
    static fromEntities(promocodes: Promocode[]): PromocodeResponseDto[];
}
