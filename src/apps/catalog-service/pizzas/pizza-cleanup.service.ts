import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PIZZAS_REPOSITORY } from "../../../libs/common/database/tokens.ts";
import type { IPizzasRepository } from "./pizza.types.ts";

const CLEANUP_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class PizzaCleanupService {
  private readonly logger = new Logger(PizzaCleanupService.name);

  constructor(
    @Inject(PIZZAS_REPOSITORY)
    private readonly pizzasRepository: IPizzasRepository
  ) {}

  @Cron("0 3 * * *")
  async handleCleanup(): Promise<number> {
    this.logger.log("Pizza cleanup started");

    try {
      const cutoffDate = new Date(Date.now() - CLEANUP_WINDOW_MS);
      const deletedCount = await this.pizzasRepository.deleteNotOrderedSince(cutoffDate);
      this.logger.log(`Pizza cleanup finished. Deleted ${deletedCount} pizzas.`);
      return deletedCount;
    } catch (error) {
      this.logger.error(
        "Pizza cleanup failed",
        error instanceof Error ? error.stack : String(error)
      );
      return 0;
    }
  }
}
