import {
  type CallHandler,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  type NestInterceptor,
} from "@nestjs/common";
import type { Response } from "express";
import type { LoggedRequest } from "./logged-request.types.ts";
import { type Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<LoggedRequest>();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl, url, ip } = request;
    const reqUrl = originalUrl || url;
    const userId = request.user?.sub;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startTime;
        const statusCode = response.statusCode;

        this.logger.log(
          {
            message: `[${method}] ${reqUrl} ${statusCode} +${durationMs}ms`,
            method,
            url: reqUrl,
            statusCode,
            durationMs,
            ip,
            userId,
          },
          "HTTP"
        );
      }),
      catchError((error: unknown) => {
        const durationMs = Date.now() - startTime;
        const statusCode =
          error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        const stack = error instanceof Error ? error.stack : undefined;

        const metadata = {
          message: `[${method}] ${reqUrl} ${statusCode} +${durationMs}ms - ${errorMessage}`,
          method,
          url: reqUrl,
          statusCode,
          durationMs,
          ip,
          userId,
          errorMessage,
        };

        request.errorLogged = true;
        this.logger.error(metadata, stack, "HTTP");

        return throwError(() => error);
      })
    );
  }
}
