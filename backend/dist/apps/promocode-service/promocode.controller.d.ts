import { RmqContext } from "@nestjs/microservices";
import type { OrderCreatedEvent, OrderFailedEvent, AvailablePromocode, ReservedPromocode } from "../../libs/contracts/index.ts";
import { PromocodesService } from "./promocodes.service.ts";
import { RedemptionsService } from "./redemptions/redemptions.service.ts";
import type { CreatePromocodeDto } from "./dto/create-promocode.dto.ts";
import type { UpdatePromocodeDto } from "./dto/update-promocode.dto.ts";
import type { Promocode } from "./promocode.entity.ts";
import { PromocodeResponseDto } from "./dto/promocode-response.dto.ts";
export declare class PromocodeMessagesController {
    private readonly promocodes;
    private readonly redemptions;
    private readonly logger;
    constructor(promocodes: PromocodesService, redemptions: RedemptionsService);
    list(): Promise<PromocodeResponseDto[]>;
    findById(payload: {
        id: string;
    }): Promise<PromocodeResponseDto>;
    findByCode(payload: {
        code: string;
    }): Promise<Promocode | null>;
    create(payload: CreatePromocodeDto): Promise<PromocodeResponseDto>;
    update(payload: {
        id: string;
        dto: UpdatePromocodeDto;
    }): Promise<PromocodeResponseDto>;
    remove(payload: {
        id: string;
    }): Promise<{
        ok: true;
    }>;
    restore(payload: {
        id: string;
    }): Promise<PromocodeResponseDto>;
    checkAvailable(payload: {
        userId: string;
        code: string;
    }): Promise<AvailablePromocode>;
    reserve(payload: {
        userId: string;
        promocodeId: string;
    }): Promise<ReservedPromocode>;
    onOrderCreated(event: OrderCreatedEvent, context: RmqContext): Promise<void>;
    onOrderFailed(event: OrderFailedEvent, context: RmqContext): Promise<void>;
}
