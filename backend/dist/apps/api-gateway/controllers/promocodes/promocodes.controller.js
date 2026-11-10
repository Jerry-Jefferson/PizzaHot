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
import { Controller, Get, Post, Body, Patch, Put, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus, } from "@nestjs/common";
import { PromocodeClient } from "../../clients/promocode.client.js";
import { CreatePromocodeDto } from "../../../promocode-service/dto/create-promocode.dto.js";
import { UpdatePromocodeDto } from "../../../promocode-service/dto/update-promocode.dto.js";
import { ZodValidationPipe } from "../../../../libs/validation/zod-validation.pipe.js";
import { createPromocodeSchema, updatePromocodeSchema, } from "../../../promocode-service/promocode.schema.js";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiCreatePromocode, ApiFindAllPromocode, ApiFindOnePromocode, ApiRemovePromocode, ApiRestorePromocode, ApiUpdatePromocode, } from "./promocodes.api-docs.js";
import { ApiAdminOnly } from "../../../../libs/swagger/api-responses.decorator.js";
import { Can } from "../../../../libs/auth/decorators/can.decorator.js";
import { Permission } from "../../../../libs/auth/permission.constant.js";
let PromocodesController = class PromocodesController {
    promocodesService;
    constructor(promocodesService) {
        this.promocodesService = promocodesService;
    }
    async create(dto) {
        return this.promocodesService.create(dto);
    }
    async findAll() {
        return this.promocodesService.findAll();
    }
    async findOne(id) {
        return this.promocodesService.findById(id);
    }
    async update(id, dto) {
        return this.promocodesService.update(id, dto);
    }
    async remove(id) {
        await this.promocodesService.remove(id);
    }
    async restore(id) {
        return this.promocodesService.restore(id);
    }
};
__decorate([
    Post(),
    Can(Permission.PROMOCODE_WRITE),
    ApiCreatePromocode(),
    __param(0, Body(new ZodValidationPipe(createPromocodeSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePromocodeDto]),
    __metadata("design:returntype", Promise)
], PromocodesController.prototype, "create", null);
__decorate([
    Get(),
    Can(Permission.PROMOCODE_READ),
    ApiFindAllPromocode(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PromocodesController.prototype, "findAll", null);
__decorate([
    Get(":id"),
    Can(Permission.PROMOCODE_READ),
    ApiFindOnePromocode(),
    __param(0, Param("id", ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PromocodesController.prototype, "findOne", null);
__decorate([
    Put(":id"),
    Can(Permission.PROMOCODE_WRITE),
    ApiUpdatePromocode(),
    __param(0, Param("id", ParseUUIDPipe)),
    __param(1, Body(new ZodValidationPipe(updatePromocodeSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdatePromocodeDto]),
    __metadata("design:returntype", Promise)
], PromocodesController.prototype, "update", null);
__decorate([
    Delete(":id"),
    Can(Permission.PROMOCODE_DELETE),
    HttpCode(HttpStatus.NO_CONTENT),
    ApiRemovePromocode(),
    __param(0, Param("id", ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PromocodesController.prototype, "remove", null);
__decorate([
    Patch(":id/restore"),
    Can(Permission.PROMOCODE_WRITE),
    ApiRestorePromocode(),
    __param(0, Param("id", ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PromocodesController.prototype, "restore", null);
PromocodesController = __decorate([
    ApiTags("Promocodes"),
    ApiBearerAuth(),
    ApiAdminOnly(),
    Controller("promocodes"),
    __metadata("design:paramtypes", [PromocodeClient])
], PromocodesController);
export { PromocodesController };
//# sourceMappingURL=promocodes.controller.js.map