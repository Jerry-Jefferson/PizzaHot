import { LogLevel } from "../../libs/logging/log-level.constant.ts";
export interface CreateLogDto {
    level: LogLevel;
    message: string;
    context?: string;
    trace?: string;
    metadata?: Record<string, unknown>;
    timestamp?: Date;
}
