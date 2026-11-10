import { Repository } from "typeorm";
import { PromocodeRedemption } from "./promocode-redemption.entity.ts";
import { RedemptionStatus } from "./redemption-status.constant.ts";
import type { IRedemptionsRepository } from "../promocode.types.ts";
export declare class RedemptionsRepository implements IRedemptionsRepository {
    private readonly repository;
    constructor(repository: Repository<PromocodeRedemption>);
    findActive(userId: string, promocodeId: string): Promise<PromocodeRedemption | null>;
    reserve(userId: string, promocodeId: string): Promise<PromocodeRedemption | null>;
    confirm(userId: string, promocodeId: string, orderId: string): Promise<void>;
    release(userId: string, promocodeId: string): Promise<void>;
    releaseStale(olderThan: Date): Promise<number>;
    countByStatus(status: RedemptionStatus): Promise<number>;
}
