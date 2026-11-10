var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CriticalErrorFilter_1;
import { Catch, HttpException, HttpStatus, Injectable, Logger, } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { EVENTS } from "../contracts/patterns.constant.js";
import { EVENTS_CLIENT } from "../messaging/tokens.constant.js";
let CriticalErrorFilter = CriticalErrorFilter_1 = class CriticalErrorFilter {
    events;
    logger = new Logger(CriticalErrorFilter_1.name);
    constructor(events) {
        this.events = events;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        let message = "Internal server error";
        let errorType = "UnknownError";
        if (exception instanceof HttpException) {
            errorType = exception.name;
            const res = exception.getResponse();
            if (typeof res === "string") {
                message = res;
            }
            else if (typeof res === "object" && res !== null) {
                const resObj = res;
                if (Array.isArray(resObj.message)) {
                    message = resObj.message.join(", ");
                }
                else if (typeof resObj.message === "string") {
                    message = resObj.message;
                }
                else {
                    message = exception.message;
                }
            }
            else {
                message = exception.message;
            }
        }
        else if (exception instanceof Error) {
            errorType = exception.name;
            message = exception.message;
        }
        const is5xx = status >= 500;
        if (is5xx) {
            const event = {
                message,
                statusCode: status,
                method: request?.method ?? "HTTP",
                path: request?.url || "N/A",
                errorType,
                timestamp: new Date().toISOString(),
            };
            try {
                this.events.emit(EVENTS.criticalError, event);
            }
            catch (error) {
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
            this.logger.error({
                message: `[${reqMethod}] ${reqUrl} ${status} - ${message}`,
                statusCode: status,
                method: reqMethod,
                path: reqUrl,
                errorType,
            }, stack, CriticalErrorFilter_1.name);
        }
        if (exception instanceof HttpException) {
            const res = exception.getResponse();
            if (typeof res === "object" && res !== null) {
                response.status(status).json(res);
            }
            else {
                response.status(status).json({
                    statusCode: status,
                    message: res,
                    timestamp: new Date().toISOString(),
                    path: request?.url,
                });
            }
        }
        else {
            response.status(status).json({
                statusCode: status,
                message: "Internal server error",
                timestamp: new Date().toISOString(),
                path: request?.url,
            });
        }
    }
};
CriticalErrorFilter = CriticalErrorFilter_1 = __decorate([
    Injectable(),
    Catch(),
    __param(0, Inject(EVENTS_CLIENT)),
    __metadata("design:paramtypes", [Object])
], CriticalErrorFilter);
export { CriticalErrorFilter };
//# sourceMappingURL=critical-error.filter.js.map