import {
  type CallHandler,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  type NestInterceptor,
} from "@nestjs/common";
import type { Request, Response } from "express";
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
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl, url, ip } = request;
    const reqUrl = originalUrl || url;
    const user = (request as unknown as { user?: { sub?: string; id?: string } }).user;
    const userId = user?.sub || user?.id;
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

        (request as unknown as Record<string, unknown>).__errorLogged = true;
        this.logger.error(metadata, stack, "HTTP");

        return throwError(() => error);
      })
    );
  }
}
