import type { ClientProxy } from "@nestjs/microservices";
import type { PromocodeResponseDto } from "../../promocode-service/dto/promocode-response.dto.ts";
import type { CreatePromocodeDto } from "../../promocode-service/dto/create-promocode.dto.ts";
import type { UpdatePromocodeDto } from "../../promocode-service/dto/update-promocode.dto.ts";
export declare class PromocodeClient {
    private readonly client;
    constructor(client: ClientProxy);
    findAll(): Promise<PromocodeResponseDto[]>;
    findById(id: string): Promise<PromocodeResponseDto>;
    create(dto: CreatePromocodeDto): Promise<PromocodeResponseDto>;
    update(id: string, dto: UpdatePromocodeDto): Promise<PromocodeResponseDto>;
    remove(id: string): Promise<{
        ok: true;
    }>;
    restore(id: string): Promise<PromocodeResponseDto>;
}
