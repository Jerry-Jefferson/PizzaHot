import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Inject } from "@nestjs/common";
import type { Response } from "express";
import { EVENTS } from "../contracts/patterns.constant.ts";
import type { CriticalErrorEvent } from "../contracts/events.types.ts";
import { EVENTS_CLIENT } from "../messaging/tokens.constant.ts";
import type { EventPublisher } from "../messaging/message-client.types.ts";
import type { LoggedRequest } from "./logged-request.types.ts";

@Injectable()
@Catch()
export class CriticalErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(CriticalErrorFilter.name);

  constructor(
    @Inject(EVENTS_CLIENT)
    private readonly events: EventPublisher
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<LoggedRequest>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = "Internal server error";
    let errorType = "UnknownError";

    if (exception instanceof HttpException) {
      errorType = exception.name;
      const res = exception.getResponse();
      if (typeof res === "string") {
        message = res;
      } else if (typeof res === "object" && res !== null) {
        const resObj = res as Record<string, unknown>;
        if (Array.isArray(resObj.message)) {
          message = resObj.message.join(", ");
        } else if (typeof resObj.message === "string") {
          message = resObj.message;
        } else {
          message = exception.message;
        }
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      errorType = exception.name;
      message = exception.message;
    }

    const is5xx = status >= 500;

    if (is5xx) {
      const event: CriticalErrorEvent = {
        message,
        statusCode: status,
        method: request?.method ?? "HTTP",
        path: request?.url || "N/A",
        errorType,
        timestamp: new Date().toISOString(),
      };

      try {
        this.events.emit(EVENTS.criticalError, event);
      } catch (error) {
        this.logger.error(`Failed to publish critical error alert: ${String(error)}`);
      }
    }

    const reqMethod = request?.method ?? "HTTP";
    const reqUrl = request?.url ?? "N/A";
    const stack = exception instanceof Error ? exception.stack : undefined;

    if (!request?.errorLogged) {
      if (request) {
        request.errorLogged = true;
      }
      this.logger.error(
        {
          message: `[${reqMethod}] ${reqUrl} ${status} - ${message}`,
          statusCode: status,
          method: reqMethod,
          path: reqUrl,
          errorType,
        },
        stack,
        CriticalErrorFilter.name
      );
    }

    if (exception instanceof HttpException) {
      const res = exception.getResponse();

      if (typeof res === "object" && res !== null) {
        response.status(status).json(res);
      } else {
        response.status(status).json({
          statusCode: status,
          message: res,
          timestamp: new Date().toISOString(),
          path: request?.url,
        });
      }
    } else {
      response.status(status).json({
        statusCode: status,
        message: "Internal server error",
        timestamp: new Date().toISOString(),
        path: request?.url,
      });
    }
  }
}
