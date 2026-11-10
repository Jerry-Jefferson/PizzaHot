var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { HttpException, HttpStatus, Injectable, Logger, } from "@nestjs/common";
import { throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
let HttpLoggingInterceptor = class HttpLoggingInterceptor {
    logger = new Logger("HTTP");
    intercept(context, next) {
        if (context.getType() !== "http") {
            return next.handle();
        }
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const { method, originalUrl, url, ip } = request;
        const reqUrl = originalUrl || url;
        const userId = request.user?.sub;
        const startTime = Date.now();
        return next.handle().pipe(tap(() => {
            const durationMs = Date.now() - startTime;
            const statusCode = response.statusCode;
            this.logger.log({
                message: `[${method}] ${reqUrl} ${statusCode} +${durationMs}ms`,
                method,
                url: reqUrl,
                statusCode,
                durationMs,
                ip,
                userId,
            }, "HTTP");
        }), catchError((error) => {
            const durationMs = Date.now() - startTime;
            const statusCode = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
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
        }));
    }
};
HttpLoggingInterceptor = __decorate([
    Injectable()
], HttpLoggingInterceptor);
export { HttpLoggingInterceptor };
//# sourceMappingURL=http-logging.interceptor.js.map