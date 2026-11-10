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
var RmqLoggerService_1;
import { ConsoleLogger, Inject, Injectable, Optional } from "@nestjs/common";
import { EVENTS } from "../contracts/patterns.constant.js";
import { EVENTS_CLIENT } from "../messaging/tokens.constant.js";
import { LogLevel } from "./log-level.constant.js";
let RmqLoggerService = RmqLoggerService_1 = class RmqLoggerService extends ConsoleLogger {
    client;
    serviceName = process.env.APP_NAME ?? "unknown";
    constructor(client) {
        super();
        this.client = client;
    }
    log(message, ...optionalParams) {
        super.log(message, ...optionalParams);
        this.publish(LogLevel.INFO, message, optionalParams);
    }
    error(message, ...optionalParams) {
        super.error(message, ...optionalParams);
        this.publish(LogLevel.ERROR, message, optionalParams);
    }
    publish(level, rawMessage, optionalParams) {
        if (!this.client) {
            return;
        }
        try {
            const { message, trace, metadata } = this.shape(rawMessage, optionalParams, level);
            let context = optionalParams.find((param) => typeof param === "string" && !param.includes("\n"));
            context ??= this.context;
            const payload = {
                level,
                message,
                context,
                trace,
                metadata,
                service: this.serviceName,
                timestamp: new Date().toISOString(),
            };
            this.client.emit(EVENTS.logWritten, payload);
        }
        catch (error) {
            process.stderr.write(`[RmqLoggerService] Failed to publish log entry: ${String(error)}\n`);
        }
    }
    shape(rawMessage, optionalParams, level) {
        let message = "";
        let trace;
        let metadata;
        if (rawMessage instanceof Error) {
            message = rawMessage.message;
            trace = rawMessage.stack;
        }
        else if (typeof rawMessage === "object" && rawMessage !== null) {
            const obj = rawMessage;
            if (typeof obj.message === "string") {
                const { message: _omit, ...rest } = obj;
                message = obj.message;
                metadata = Object.keys(rest).length > 0 ? rest : undefined;
            }
            else {
                message = JSON.stringify(rawMessage) ?? "";
            }
        }
        else {
            message = RmqLoggerService_1.stringify(rawMessage);
        }
        if (level === LogLevel.ERROR && !trace) {
            trace = optionalParams.find((param) => typeof param === "string" && param.includes("\n"));
        }
        return { message, trace, metadata };
    }
    static stringify(value) {
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
};
RmqLoggerService = RmqLoggerService_1 = __decorate([
    Injectable(),
    __param(0, Optional()),
    __param(0, Inject(EVENTS_CLIENT)),
    __metadata("design:paramtypes", [Function])
], RmqLoggerService);
export { RmqLoggerService };
//# sourceMappingURL=rmq-logger.service.js.map