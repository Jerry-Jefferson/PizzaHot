import type { ClientProxy } from "@nestjs/microservices";
import type { IPromocodesRepository } from "./promocode.types.ts";
import { Promocode } from "./promocode.entity.ts";
import { CreatePromocodeDto } from "./dto/create-promocode.dto.ts";
import { UpdatePromocodeDto } from "./dto/update-promocode.dto.ts";
import { PromocodeResponseDto } from "./dto/promocode-response.dto.ts";
export declare class PromocodesService {
    private readonly promocodesRepository;
    private readonly events;
    private readonly logger;
    constructor(promocodesRepository: IPromocodesRepository, events: ClientProxy);
    create(dto: CreatePromocodeDto): Promise<PromocodeResponseDto>;
    findAll(): Promise<PromocodeResponseDto[]>;
    findById(id: string): Promise<Promocode>;
    findByCode(code: string): Promise<Promocode | null>;
    findByCodeOrFail(code: string): Promise<Promocode>;
    assertNotExpired(promocode: Promocode): void;
    update(id: string, dto: UpdatePromocodeDto): Promise<PromocodeResponseDto>;
    remove(id: string): Promise<void>;
    restore(id: string): Promise<PromocodeResponseDto>;
    getById(id: string): Promise<PromocodeResponseDto>;
}
