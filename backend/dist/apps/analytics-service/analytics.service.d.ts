import type { IAnalyticsRepository, MostOrderedPizzaResult, UserAboveAverageCheckResult } from "./analytics.types.ts";
export declare class AnalyticsService {
    private readonly analyticsRepository;
    constructor(analyticsRepository: IAnalyticsRepository);
    getMostOrderedPizzaInMonth(month: number, year: number): Promise<MostOrderedPizzaResult | null>;
    getUsersWithAboveAverageCheck(): Promise<UserAboveAverageCheckResult[]>;
}
