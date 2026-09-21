import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import { PromocodeRedemption } from "./promocode-redemption.entity.ts";
import { RedemptionStatus } from "./redemption-status.constant.ts";
import type { IRedemptionsRepository } from "../promocode.types.ts";

@Injectable()
export class RedemptionsRepository implements IRedemptionsRepository {
  constructor(
    @InjectRepository(PromocodeRedemption)
    private readonly repository: Repository<PromocodeRedemption>
  ) {}

  async findActive(userId: string, promocodeId: string): Promise<PromocodeRedemption | null> {
    return this.repository.findOne({ where: { userId, promocodeId } });
  }

  async reserve(userId: string, promocodeId: string): Promise<PromocodeRedemption | null> {
    const result = await this.repository
      .createQueryBuilder()
      .insert()
      .into(PromocodeRedemption)
      .values({ userId, promocodeId, status: RedemptionStatus.PENDING })
      .orIgnore()
      .returning("*")
      .execute();

    const row = result.raw as PromocodeRedemption[];
    return row.length > 0 ? row[0] : null;
  }

  async confirm(userId: string, promocodeId: string, orderId: string): Promise<void> {
    await this.repository.update(
      { userId, promocodeId },
      { status: RedemptionStatus.CONFIRMED, orderId }
    );
  }

  async release(userId: string, promocodeId: string): Promise<void> {
    await this.repository.delete({ userId, promocodeId, status: RedemptionStatus.PENDING });
  }

  async releaseStale(olderThan: Date): Promise<number> {
    const result = await this.repository.delete({
      status: RedemptionStatus.PENDING,
      createdAt: LessThan(olderThan),
    });
    return result.affected ?? 0;
  }

  async countByStatus(status: RedemptionStatus): Promise<number> {
    return this.repository.count({ where: { status } });
  }
}
