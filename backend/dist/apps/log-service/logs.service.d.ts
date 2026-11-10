import { Model } from "mongoose";
import { Log, type LogDocument } from "./schemas/log.schema.ts";
import type { CreateLogDto } from "./create-log.dto.ts";
import type { ListLogsQuery } from "./schemas/log-query.schema.ts";
import { PaginatedResponseDto } from "../../libs/pagination/paginated-response.dto.ts";
export declare class LogsService {
    private readonly logModel;
    constructor(logModel: Model<LogDocument>);
    create(dto: CreateLogDto): Promise<LogDocument | null>;
    findAll(query: ListLogsQuery): Promise<PaginatedResponseDto<Log>>;
}
