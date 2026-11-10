import { ConsoleLogger, Inject, Injectable, Optional, type LoggerService } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { EVENTS } from "../contracts/patterns.constant.ts";
import type { LogWrittenEvent } from "../contracts/events.types.ts";
import { EVENTS_CLIENT } from "../messaging/tokens.constant.ts";
import { LogLevel } from "./log-level.constant.ts";

@Injectable()
export class RmqLoggerService extends ConsoleLogger implements LoggerService {
  private readonly serviceName = process.env.APP_NAME ?? "unknown";

  constructor(@Optional() @Inject(EVENTS_CLIENT) private readonly client?: ClientProxy) {
    super();
  }

  override log(message: unknown, ...optionalParams: unknown[]): void {
    super.log(message, ...optionalParams);
    this.publish(LogLevel.INFO, message, optionalParams);
  }

  override error(message: unknown, ...optionalParams: unknown[]): void {
    super.error(message, ...optionalParams);
    this.publish(LogLevel.ERROR, message, optionalParams);
  }

  private publish(level: LogLevel, rawMessage: unknown, optionalParams: unknown[]): void {
    if (!this.client) {
      return;
    }

    try {
      const { message, trace, metadata } = this.shape(rawMessage, optionalParams, level);
      let context = optionalParams.find(
        (param): param is string => typeof param === "string" && !param.includes("\n")
      );
      context ??= this.context;

      const payload: LogWrittenEvent = {
        level,
        message,
        context,
        trace,
        metadata,
        service: this.serviceName,
        timestamp: new Date().toISOString(),
      };

      this.client.emit(EVENTS.logWritten, payload);
    } catch (error) {
      process.stderr.write(`[RmqLoggerService] Failed to publish log entry: ${String(error)}\n`);
    }
  }

  private shape(
    rawMessage: unknown,
    optionalParams: unknown[],
    level: LogLevel
  ): { message: string; trace?: string; metadata?: Record<string, unknown> } {
    let message = "";
    let trace: string | undefined;
    let metadata: Record<string, unknown> | undefined;

    if (rawMessage instanceof Error) {
      message = rawMessage.message;
      trace = rawMessage.stack;
    } else if (typeof rawMessage === "object" && rawMessage !== null) {
      const obj = rawMessage as Record<string, unknown>;
      if (typeof obj.message === "string") {
        const { message: _omit, ...rest } = obj;
        message = obj.message;
        metadata = Object.keys(rest).length > 0 ? rest : undefined;
      } else {
        message = JSON.stringify(rawMessage) ?? "";
      }
    } else {
      message = RmqLoggerService.stringify(rawMessage);
    }

    if (level === LogLevel.ERROR && !trace) {
      trace = optionalParams.find(
        (param): param is string => typeof param === "string" && param.includes("\n")
      );
    }

    return { message, trace, metadata };
  }

  private static stringify(value: unknown): string {
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
