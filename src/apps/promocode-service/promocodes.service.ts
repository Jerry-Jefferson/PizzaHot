import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { PROMOCODES_REPOSITORY } from "../../libs/database/tokens.ts";
import { EVENTS_CLIENT } from "../../libs/messaging/tokens.constant.ts";
import { EVENTS, DiscountMode } from "../../libs/contracts/index.ts";
import type { PromocodeDeletedEvent } from "../../libs/contracts/index.ts";
import type { IPromocodesRepository } from "./promocode.types.ts";
import { Promocode } from "./promocode.entity.ts";
import { CreatePromocodeDto } from "./dto/create-promocode.dto.ts";
import { UpdatePromocodeDto } from "./dto/update-promocode.dto.ts";
import { PromocodeResponseDto } from "./dto/promocode-response.dto.ts";

@Injectable()
export class PromocodesService {
  private readonly logger = new Logger(PromocodesService.name);

  constructor(
    @Inject(PROMOCODES_REPOSITORY)
    private readonly promocodesRepository: IPromocodesRepository,
    @Inject(EVENTS_CLIENT)
    private readonly events: ClientProxy
  ) {}

  async create(dto: CreatePromocodeDto): Promise<PromocodeResponseDto> {
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

  async findAll(): Promise<PromocodeResponseDto[]> {
    return PromocodeResponseDto.fromEntities(await this.promocodesRepository.findAll());
  }

  async findById(id: string): Promise<Promocode> {
    const promocode = await this.promocodesRepository.findById(id);
    if (!promocode) {
      throw new NotFoundException("Promocode not found");
    }
    return promocode;
  }

  async findByCode(code: string): Promise<Promocode | null> {
    return this.promocodesRepository.findByCode(code);
  }

  async findByCodeOrFail(code: string): Promise<Promocode> {
    const promocode = await this.promocodesRepository.findByCode(code.trim().toUpperCase());
    if (!promocode) {
      throw new NotFoundException("Promocode not found");
    }
    return promocode;
  }

  assertNotExpired(promocode: Promocode): void {
    if (new Date(promocode.validTill) < new Date()) {
      throw new BadRequestException("Promocode has expired");
    }
  }

  async update(id: string, dto: UpdatePromocodeDto): Promise<PromocodeResponseDto> {
    const current = await this.findById(id);

    if (dto.code) {
      const existing = await this.promocodesRepository.findByCode(dto.code);
      if (existing && existing.id !== id) {
        throw new ConflictException("Promocode with this code already exists");
      }
    }

    const effectiveMode = dto.discountMode ?? current.discountMode;
    const effectiveDiscount = dto.discount ?? current.discount;
    if (effectiveMode === DiscountMode.PERCENTAGE && effectiveDiscount > 100) {
      throw new BadRequestException("Percentage discount cannot exceed 100");
    }

    const updated = await this.promocodesRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException("Promocode not found");
    }
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.promocodesRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException("Promocode not found");
    }

    const event: PromocodeDeletedEvent = { promocodeId: id };

    try {
      this.events.emit(EVENTS.promocodeDeleted, event);
    } catch (error) {
      this.logger.error(`Failed to publish promocode.deleted for ${id}: ${String(error)}`);
    }

    this.logger.log(`Promocode deleted: id ${id}`);
  }

  async restore(id: string): Promise<PromocodeResponseDto> {
    const restored = await this.promocodesRepository.restore(id);
    if (!restored) {
      throw new NotFoundException("Promocode not found");
    }
    return this.findById(id);
  }

  async getById(id: string): Promise<PromocodeResponseDto> {
    return PromocodeResponseDto.fromEntity(await this.findById(id));
  }
}
