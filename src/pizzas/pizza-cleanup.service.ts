import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PIZZAS_REPOSITORY } from "../shared/database/tokens.ts";
import type { IPizzasRepository } from "./interfaces/pizzas.repository.interface.ts";

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
      const deletedCount = await this.pizzasRepository.deleteNotOrderedMonth();
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
