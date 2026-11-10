import { AnalyticsClient } from "../../clients/analytics.client.ts";
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsClient);
    getMostOrderedPizza(query: {
        month: number;
        year: number;
    }): Promise<import("../../../analytics-service/analytics.types.ts").MostOrderedPizzaResult>;
    getUsersAboveAverageCheck(): Promise<import("../../../analytics-service/analytics.types.ts").UserAboveAverageCheckResult[]>;
}
