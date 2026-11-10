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
var PromocodesService_1;
import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException, } from "@nestjs/common";
import { PROMOCODES_REPOSITORY } from "../../libs/database/tokens.js";
import { EVENTS_CLIENT } from "../../libs/messaging/tokens.constant.js";
import { EVENTS, DiscountMode } from "../../libs/contracts/index.js";
import { PromocodeResponseDto } from "./dto/promocode-response.dto.js";
let PromocodesService = PromocodesService_1 = class PromocodesService {
    promocodesRepository;
    events;
    logger = new Logger(PromocodesService_1.name);
    constructor(promocodesRepository, events) {
        this.promocodesRepository = promocodesRepository;
        this.events = events;
    }
    async create(dto) {
        const existing = await this.promocodesRepository.findByCode(dto.code);
        if (existing) {
            throw new ConflictException("Promocode with this code already exists");
        }
        if (dto.discountMode === DiscountMode.PERCENTAGE && dto.discount > 100) {
            throw new BadRequestException("Percentage discount cannot exceed 100");
        }
        const promocode = this.promocodesRepository.create(dto);
        const saved = await this.promocodesRepository.save(promocode);
        this.logger.log(`Promocode created: "${saved.code}" (discount: ${saved.discount})`);
        return PromocodeResponseDto.fromEntity(saved);
    }
    async findAll() {
        return PromocodeResponseDto.fromEntities(await this.promocodesRepository.findAll());
    }
    async findById(id) {
        const promocode = await this.promocodesRepository.findById(id);
        if (!promocode) {
            throw new NotFoundException("Promocode not found");
        }
        return promocode;
    }
    async findByCode(code) {
        return this.promocodesRepository.findByCode(code);
    }
    async findByCodeOrFail(code) {
        const promocode = await this.promocodesRepository.findByCode(code.trim().toUpperCase());
        if (!promocode) {
            throw new NotFoundException("Promocode not found");
        }
        return promocode;
    }
    assertNotExpired(promocode) {
        if (new Date(promocode.validTill) < new Date()) {
            throw new BadRequestException("Promocode has expired");
        }
    }
    async update(id, dto) {
        await this.findById(id);
        const existing = await this.promocodesRepository.findByCode(dto.code);
        if (existing && existing.id !== id) {
            throw new ConflictException("Promocode with this code already exists");
        }
        if (dto.discountMode === DiscountMode.PERCENTAGE && dto.discount > 100) {
            throw new BadRequestException("Percentage discount cannot exceed 100");
        }
        const updated = await this.promocodesRepository.update(id, dto);
        if (!updated) {
            throw new NotFoundException("Promocode not found");
        }
        return this.findById(id);
    }
    async remove(id) {
        const deleted = await this.promocodesRepository.remove(id);
        if (!deleted) {
            throw new NotFoundException("Promocode not found");
        }
        const event = { promocodeId: id };
        try {
            this.events.emit(EVENTS.promocodeDeleted, event);
        }
        catch (error) {
            this.logger.error(`Failed to publish promocode.deleted for ${id}: ${String(error)}`);
        }
        this.logger.log(`Promocode deleted: id ${id}`);
    }
    async restore(id) {
        const restored = await this.promocodesRepository.restore(id);
        if (!restored) {
            throw new NotFoundException("Promocode not found");
        }
        return this.findById(id);
    }
    async getById(id) {
        return PromocodeResponseDto.fromEntity(await this.findById(id));
    }
};
PromocodesService = PromocodesService_1 = __decorate([
    Injectable(),
    __param(0, Inject(PROMOCODES_REPOSITORY)),
    __param(1, Inject(EVENTS_CLIENT)),
    __metadata("design:paramtypes", [Object, Function])
], PromocodesService);
export { PromocodesService };
//# sourceMappingURL=promocodes.service.js.map