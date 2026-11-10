import type { Promocode } from "./promocode.entity.ts";
import type { PromocodeRedemption } from "./redemptions/promocode-redemption.entity.ts";
import type { RedemptionStatus } from "./redemptions/redemption-status.constant.ts";

export interface IPromocodesRepository {
  create(data: Partial<Promocode>): Promocode;
  save(promocode: Promocode): Promise<Promocode>;
  findAll(): Promise<Promocode[]>;
  findById(id: string): Promise<Promocode | null>;
  findByCode(code: string): Promise<Promocode | null>;
  update(id: string, data: Partial<Promocode>): Promise<boolean>;
  remove(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}

export interface IRedemptionsRepository {
  findActive(userId: string, promocodeId: string): Promise<PromocodeRedemption | null>;
  reserve(userId: string, promocodeId: string): Promise<PromocodeRedemption | null>;
  confirm(userId: string, promocodeId: string, orderId: string): Promise<void>;
  release(userId: string, promocodeId: string): Promise<void>;
  releaseStale(olderThan: Date): Promise<number>;
  countByStatus(status: RedemptionStatus): Promise<number>;
}
