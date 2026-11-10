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
import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiGetLogs } from "./logs.api-docs.js";
import { ApiOwnerOnly } from "../../../../libs/swagger/api-responses.decorator.js";
import { ZodValidationPipe } from "../../../../libs/validation/zod-validation.pipe.js";
import { LogClient } from "../../clients/analytics.client.js";
import { listLogsQuerySchema, } from "../../../log-service/schemas/log-query.schema.js";
import { Can } from "../../../../libs/auth/decorators/can.decorator.js";
import { Permission } from "../../../../libs/auth/permission.constant.js";
let LogsController = class LogsController {
    logsService;
    constructor(logsService) {
        this.logsService = logsService;
    }
    async getLogs(query) {
        return this.logsService.findAll(query);
    }
};
__decorate([
    Get(),
    Can(Permission.LOG_READ),
    ApiGetLogs(),
    __param(0, Query(new ZodValidationPipe(listLogsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LogsController.prototype, "getLogs", null);
LogsController = __decorate([
    ApiTags("Logs"),
    ApiBearerAuth(),
    ApiOwnerOnly(),
    Controller("logs"),
    __metadata("design:paramtypes", [LogClient])
], LogsController);
export { LogsController };
//# sourceMappingURL=logs.controller.js.map