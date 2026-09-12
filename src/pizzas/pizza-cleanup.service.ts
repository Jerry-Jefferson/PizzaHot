import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PizzasRepository } from "./pizzas.repository.ts";

@Injectable()
export class PizzaCleanupService {
  private readonly logger = new Logger(PizzaCleanupService.name);

  constructor(private readonly pizzasRepository: PizzasRepository) {}

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
