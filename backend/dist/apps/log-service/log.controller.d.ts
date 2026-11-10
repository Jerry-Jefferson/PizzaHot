import { RmqContext } from "@nestjs/microservices";
import type { LogWrittenEvent } from "../../libs/contracts/index.ts";
import { LogsService } from "./logs.service.ts";
import type { ListLogsQuery } from "./schemas/log-query.schema.ts";
import type { PaginatedResponseDto } from "../../libs/pagination/paginated-response.dto.ts";
import type { Log } from "./schemas/log.schema.ts";
export declare class LogMessagesController {
    private readonly logsService;
    private readonly logger;
    constructor(logsService: LogsService);
    onLogWritten(event: LogWrittenEvent, context: RmqContext): Promise<void>;
    findAll(query: ListLogsQuery): Promise<PaginatedResponseDto<Log>>;
}
