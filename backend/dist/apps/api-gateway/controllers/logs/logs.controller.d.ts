import { LogClient } from "../../clients/analytics.client.ts";
import { type ListLogsQuery } from "../../../log-service/schemas/log-query.schema.ts";
export declare class LogsController {
    private readonly logsService;
    constructor(logsService: LogClient);
    getLogs(query: ListLogsQuery): Promise<import("../../../../libs/pagination/paginated-response.dto.ts").PaginatedResponseDto<import("../../../log-service/schemas/log.schema.ts").Log>>;
}
