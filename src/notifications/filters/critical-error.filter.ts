import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";
import { NotificationType } from "../constants/notification-type.constant.ts";
import { NotificationsService } from "../notifications.service.ts";

@Injectable()
@Catch()
export class CriticalErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(CriticalErrorFilter.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService
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

    const is4xx = status >= 400 && status < 500;

    if (is4xx) {
      const adminEmail =
        this.configService.get<string>("CRITICAL_ERROR_EMAIL") ?? "admin@pizzahot.local";

      this.notificationsService
        .send({
          type: NotificationType.CRITICAL_ERROR,
          recipient: adminEmail,
          data: {
            message,
            statusCode: status,
            path: request?.url || "N/A",
            errorType,
            timestamp: new Date().toISOString(),
          },
        })
        .catch((err) => {
          this.logger.error(`Failed to trigger critical error notification: ${err}`);
        });
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
