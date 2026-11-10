import type { ClientProxy } from "@nestjs/microservices";
import type { ListLogsQuery } from "../../log-service/schemas/log-query.schema.ts";
import type { Log } from "../../log-service/schemas/log.schema.ts";
import type { PaginatedResponseDto } from "../../../libs/pagination/paginated-response.dto.ts";
import type { MostOrderedPizzaResult, UserAboveAverageCheckResult } from "../../analytics-service/analytics.types.ts";
export declare class AnalyticsClient {
    private readonly client;
    constructor(client: ClientProxy);
    getMostOrderedPizzaInMonth(month: number, year: number): Promise<MostOrderedPizzaResult | null>;
    getUsersWithAboveAverageCheck(): Promise<UserAboveAverageCheckResult[]>;
}
export declare class LogClient {
    private readonly client;
    constructor(client: ClientProxy);
    findAll(query: ListLogsQuery): Promise<PaginatedResponseDto<Log>>;
}
