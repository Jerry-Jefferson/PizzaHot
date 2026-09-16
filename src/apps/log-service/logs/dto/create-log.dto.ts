import { LogLevel } from "../../../../libs/logging/log-level.enum.ts";

export interface CreateLogDto {
  level: LogLevel;
  message: string;
  context?: string;
  trace?: string;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
}
