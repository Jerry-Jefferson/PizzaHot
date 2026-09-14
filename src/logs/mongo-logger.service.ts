import { ConsoleLogger, Injectable, type LoggerService } from "@nestjs/common";
import { LogsService } from "./logs.service.ts";
import { LogLevel } from "./constants/log-level.enum.ts";

@Injectable()
export class MongoLoggerService extends ConsoleLogger implements LoggerService {
  constructor(private readonly logsService: LogsService) {
    super();
  }

  override log(message: unknown, ...optionalParams: unknown[]): void {
    super.log(message, ...optionalParams);
    this.writeToMongo(LogLevel.INFO, message, optionalParams);
  }

  override error(message: unknown, ...optionalParams: unknown[]): void {
    super.error(message, ...optionalParams);
    this.writeToMongo(LogLevel.ERROR, message, optionalParams);
  }

  private writeToMongo(level: LogLevel, rawMessage: unknown, optionalParams: unknown[]): void {
    try {
      let messageStr = "";
      let metadata: Record<string, unknown> | undefined;
      let context: string | undefined;
      let trace: string | undefined;

      if (rawMessage instanceof Error) {
        messageStr = rawMessage.message;
        trace = rawMessage.stack;
      } else if (typeof rawMessage === "object" && rawMessage !== null) {
        const obj = rawMessage as Record<string, unknown>;
        if (typeof obj.message === "string") {
          messageStr = obj.message;
          const { message: _, ...rest } = obj;
          metadata = Object.keys(rest).length > 0 ? rest : undefined;
        } else {
          messageStr = JSON.stringify(rawMessage);
        }
      } else {
        messageStr = MongoLoggerService.stringifyMessage(rawMessage);
      }

      if (level === LogLevel.ERROR) {
        for (const param of optionalParams) {
          if (!trace) {
            if (param instanceof Error) {
              trace = param.stack;
              continue;
            }
            if (typeof param === "string" && (param.includes("\n") || param.includes("at "))) {
              trace = param;
              continue;
            }
          }
          if (!context && typeof param === "string") {
            context = param;
          } else if (typeof param === "object" && param !== null && !(param instanceof Error)) {
            metadata = { ...(metadata ?? {}), ...(param as Record<string, unknown>) };
          }
        }
      } else {
        for (const param of optionalParams) {
          if (!context && typeof param === "string") {
            context = param;
          } else if (typeof param === "object" && param !== null) {
            metadata = { ...(metadata ?? {}), ...(param as Record<string, unknown>) };
          }
        }
      }

      if (!context && this.context) {
        context = this.context;
      }

      void this.logsService.create({
        level,
        message: messageStr,
        context,
        trace,
        metadata,
      });
    } catch (error) {
      // Logging must never break the caller, but it should not vanish either.
      // stderr keeps this off the logger's own path, so a broken logger cannot recurse.
      process.stderr.write(`[MongoLoggerService] Failed to record log entry: ${String(error)}\n`);
    }
  }

  /**
   * Renders a log message that is neither an Error nor an object. Handles every
   * primitive explicitly so a stray value can never be written as "[object Object]".
   */
  private static stringifyMessage(value: unknown): string {
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "symbol" || typeof value === "function") {
      return value.toString();
    }
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
      return String(value);
    }
    return JSON.stringify(value) ?? "undefined";
  }
}
