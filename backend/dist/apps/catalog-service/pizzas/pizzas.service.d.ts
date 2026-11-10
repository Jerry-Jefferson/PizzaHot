import type { IPizzasRepository } from "./pizza.types.ts";
import { Pizza } from "./pizza.entity.ts";
import { IngredientsService } from "../ingredients/ingredients.service.ts";
import type { ClientProxy } from "@nestjs/microservices";
import { CreatePizzaDto } from "./dto/create-pizza.dto.ts";
import { UpdatePizzaDto } from "./dto/update-pizza.dto.ts";
import type { IImageStorage } from "../../../libs/upload/index.ts";
import { PizzaResponseDto } from "./dto/pizza-response.dto.ts";
import type { PaginatedResult } from "../../../libs/pagination/pagination.types.ts";
export declare class PizzasService {
    private readonly pizzasRepository;
    private readonly ingredientsService;
    private readonly events;
    private readonly images;
    private readonly logger;
    constructor(pizzasRepository: IPizzasRepository, ingredientsService: IngredientsService, events: ClientProxy, images: IImageStorage);
    create(dto: CreatePizzaDto): Promise<PizzaResponseDto>;
    findAll(page: number, limit: number, search?: string): Promise<PaginatedResult<PizzaResponseDto>>;
    findById(id: string): Promise<Pizza>;
    update(id: string, dto: UpdatePizzaDto): Promise<PizzaResponseDto>;
    setImagePath(id: string, imagePath: string): Promise<PizzaResponseDto>;
    remove(id: string): Promise<void>;
    private notifyMissingImage;
    private notifyImageDeletionFailure;
    private publishUpsert;
    getById(id: string): Promise<PizzaResponseDto>;
}
