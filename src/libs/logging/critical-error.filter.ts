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
import type { ClientProxy } from "@nestjs/microservices";
import type { Request, Response } from "express";
import { EVENTS } from "../contracts/patterns.ts";
import type { CriticalErrorEvent } from "../contracts/events.ts";
import { EVENTS_CLIENT } from "../messaging/tokens.ts";

@Injectable()
@Catch()
export class CriticalErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(CriticalErrorFilter.name);

  constructor(
    @Inject(EVENTS_CLIENT)
    private readonly events: ClientProxy
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

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

    // Only server-side failures are worth waking an administrator for. 4xx responses
    // are client mistakes - a wrong password or a mistyped URL - and alerting on them
    // meant any bot probing the API could flood the mailbox.
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

    const requestObj = request as unknown as Record<string, unknown> | undefined;
    if (!requestObj?.__errorLogged) {
      if (requestObj) {
        requestObj.__errorLogged = true;
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
