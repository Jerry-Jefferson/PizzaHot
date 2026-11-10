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
var LogMessagesController_1;
import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { EVENTS, RPC } from "../../libs/contracts/index.js";
import { LogsService } from "./logs.service.js";
import { ack } from "../../libs/messaging/ack.js";
let LogMessagesController = LogMessagesController_1 = class LogMessagesController {
    logsService;
    logger = new Logger(LogMessagesController_1.name);
    constructor(logsService) {
        this.logsService = logsService;
    }
    async onLogWritten(event, context) {
        await ack(context, this.logger, EVENTS.logWritten, async () => {
            await this.logsService.create({
                level: event.level,
                message: event.message,
                context: event.context,
                trace: event.trace,
                metadata: { ...(event.metadata ?? {}), service: event.service },
                timestamp: event.timestamp ? new Date(event.timestamp) : undefined,
            });
        });
    }
    findAll(query) {
        return this.logsService.findAll(query);
    }
};
__decorate([
    EventPattern(EVENTS.logWritten),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], LogMessagesController.prototype, "onLogWritten", null);
__decorate([
    MessagePattern(RPC.log.query),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LogMessagesController.prototype, "findAll", null);
LogMessagesController = LogMessagesController_1 = __decorate([
    Controller(),
    __metadata("design:paramtypes", [LogsService])
], LogMessagesController);
export { LogMessagesController };
//# sourceMappingURL=log.controller.js.map