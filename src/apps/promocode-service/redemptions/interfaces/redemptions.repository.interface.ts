import type { PromocodeRedemption } from "../entities/promocode-redemption.entity.ts";
import type { RedemptionStatus } from "../constants/redemption-status.constant.ts";

export interface IRedemptionsRepository {
  findActive(userId: string, promocodeId: string): Promise<PromocodeRedemption | null>;
  reserve(userId: string, promocodeId: string): Promise<PromocodeRedemption | null>;
  confirm(userId: string, promocodeId: string, orderId: string): Promise<void>;
  release(userId: string, promocodeId: string): Promise<void>;
  releaseStale(olderThan: Date): Promise<number>;
  countByStatus(status: RedemptionStatus): Promise<number>;
}
