import { PromocodeClient } from "../../clients/promocode.client.ts";
import { CreatePromocodeDto } from "../../../promocode-service/dto/create-promocode.dto.ts";
import { UpdatePromocodeDto } from "../../../promocode-service/dto/update-promocode.dto.ts";
import { PromocodeResponseDto } from "../../../promocode-service/dto/promocode-response.dto.ts";
export declare class PromocodesController {
    private readonly promocodesService;
    constructor(promocodesService: PromocodeClient);
    create(dto: CreatePromocodeDto): Promise<PromocodeResponseDto>;
    findAll(): Promise<PromocodeResponseDto[]>;
    findOne(id: string): Promise<PromocodeResponseDto>;
    update(id: string, dto: UpdatePromocodeDto): Promise<PromocodeResponseDto>;
    remove(id: string): Promise<void>;
    restore(id: string): Promise<PromocodeResponseDto>;
}
