import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { REDEMPTIONS_REPOSITORY } from "../../../libs/common/database/tokens.ts";
import type { IRedemptionsRepository } from "./interfaces/redemptions.repository.interface.ts";

const RESERVATION_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class RedemptionsService {
  private readonly logger = new Logger(RedemptionsService.name);

  constructor(
    @Inject(REDEMPTIONS_REPOSITORY)
    private readonly redemptions: IRedemptionsRepository
  ) {}

  async isAvailableFor(userId: string, promocodeId: string): Promise<boolean> {
    const existing = await this.redemptions.findActive(userId, promocodeId);
    return existing === null;
  }

  async assertAvailableFor(userId: string, promocodeId: string): Promise<void> {
    if (!(await this.isAvailableFor(userId, promocodeId))) {
      throw new BadRequestException("You have already used this promocode in a previous order");
    }
  }

  async reserve(userId: string, promocodeId: string): Promise<void> {
    const reserved = await this.redemptions.reserve(userId, promocodeId);

    if (!reserved) {
      throw new BadRequestException("You have already used this promocode in a previous order");
    }
  }

  async confirm(userId: string, promocodeId: string, orderId: string): Promise<void> {
    await this.redemptions.confirm(userId, promocodeId, orderId);
  }

  async release(userId: string, promocodeId: string): Promise<void> {
    await this.redemptions.release(userId, promocodeId);
  }

  @Cron("*/5 * * * *")
  async reapStaleReservations(): Promise<number> {
    try {
      const released = await this.redemptions.releaseStale(
        new Date(Date.now() - RESERVATION_TTL_MS)
      );

      if (released > 0) {
        this.logger.warn(`Released ${released} stale promocode reservation(s)`);
      }

      return released;
    } catch (error) {
      this.logger.error(
        "Stale reservation reaper failed",
        error instanceof Error ? error.stack : String(error)
      );
      return 0;
    }
  }
}
