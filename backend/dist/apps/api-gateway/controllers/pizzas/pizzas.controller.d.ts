import { CatalogClient } from "../../clients/catalog.client.ts";
import { PaginatedResponseDto } from "../../../../libs/pagination/paginated-response.dto.ts";
import { CreatePizzaDto } from "../../../catalog-service/pizzas/dto/create-pizza.dto.ts";
import { UpdatePizzaDto } from "../../../catalog-service/pizzas/dto/update-pizza.dto.ts";
import { PizzaResponseDto } from "../../../catalog-service/pizzas/dto/pizza-response.dto.ts";
export declare class PizzasController {
    private readonly pizzasService;
    constructor(pizzasService: CatalogClient);
    findAll(query: {
        page: number;
        limit: number;
        search?: string;
    }): Promise<PaginatedResponseDto<PizzaResponseDto>>;
    findOne(id: string): Promise<PizzaResponseDto>;
    addPizza(dto: CreatePizzaDto): Promise<PizzaResponseDto>;
    update(id: string, dto: UpdatePizzaDto): Promise<PizzaResponseDto>;
    uploadImage(id: string, image: Express.Multer.File): Promise<PizzaResponseDto>;
    remove(id: string): Promise<void>;
}
