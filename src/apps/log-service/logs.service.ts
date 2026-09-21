import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Log, type LogDocument } from "./schemas/log.schema.ts";
import type { CreateLogDto } from "./create-log.dto.ts";
import type { ListLogsQuery } from "./schemas/log-query.schema.ts";
import { PaginatedResponseDto } from "../../libs/common/pagination/paginated-response.dto.ts";

@Injectable()
export class LogsService {
  constructor(@InjectModel(Log.name) private readonly logModel: Model<LogDocument>) {}

  async create(dto: CreateLogDto): Promise<LogDocument | null> {
    try {
      return await this.logModel.create({
        level: dto.level,
        message: dto.message,
        context: dto.context,
        trace: dto.trace,
        metadata: dto.metadata,
        timestamp: dto.timestamp ?? new Date(),
      });
    } catch (err) {
      process.stderr.write(`[LogsService] Failed to persist log to MongoDB: ${err}\n`);
      return null;
    }
  }

  async findAll(query: ListLogsQuery): Promise<PaginatedResponseDto<Log>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.level) {
      filter.level = query.level;
    }
    if (query.context) {
      filter.context = query.context;
    }

    const [data, total] = await Promise.all([
      this.logModel.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean().exec(),
      this.logModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResponseDto(data, page, limit, total);
  }
}
