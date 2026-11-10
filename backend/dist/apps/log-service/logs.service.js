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
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Log } from "./schemas/log.schema.js";
import { PaginatedResponseDto } from "../../libs/pagination/paginated-response.dto.js";
let LogsService = class LogsService {
    logModel;
    constructor(logModel) {
        this.logModel = logModel;
    }
    async create(dto) {
        try {
            return await this.logModel.create({
                level: dto.level,
                message: dto.message,
                context: dto.context,
                trace: dto.trace,
                metadata: dto.metadata,
                timestamp: dto.timestamp ?? new Date(),
            });
        }
        catch (err) {
            process.stderr.write(`[LogsService] Failed to persist log to MongoDB: ${err}\n`);
            return null;
        }
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.level) {
            filter.level = query.level;
        }
        if (query.context) {
            filter.context = query.context;
        }
        const [data, total] = await Promise.all([
            this.logModel.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean().exec(),
            this.logModel.countDocuments(filter).exec(),
        ]);
        return new PaginatedResponseDto(data, page, limit, total);
    }
};
LogsService = __decorate([
    Injectable(),
    __param(0, InjectModel(Log.name)),
    __metadata("design:paramtypes", [Model])
], LogsService);
export { LogsService };
//# sourceMappingURL=logs.service.js.map