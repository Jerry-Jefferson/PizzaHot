import { Inject, Injectable } from "@nestjs/common";
import { ANALYTICS_REPOSITORY } from "../../../libs/common/database/tokens.ts";
import type {
  IAnalyticsRepository,
  MostOrderedPizzaResult,
  UserAboveAverageCheckResult,
} from "./interfaces/analytics.repository.interface.ts";

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: IAnalyticsRepository
  ) {}

  async getMostOrderedPizzaInMonth(
    month: number,
    year: number
  ): Promise<MostOrderedPizzaResult | null> {
    return this.analyticsRepository.getMostOrderedPizzaInMonth(month, year);
  }

  async getUsersWithAboveAverageCheck(): Promise<UserAboveAverageCheckResult[]> {
    return this.analyticsRepository.getUsersWithAboveAverageCheck();
  }
}
