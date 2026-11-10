import type { ClientProxy } from "@nestjs/microservices";
import type { PizzaResponseDto } from "../../catalog-service/pizzas/dto/pizza-response.dto.ts";
import type { CreatePizzaDto } from "../../catalog-service/pizzas/dto/create-pizza.dto.ts";
import type { UpdatePizzaDto } from "../../catalog-service/pizzas/dto/update-pizza.dto.ts";
import type { IngredientResponseDto } from "../../catalog-service/ingredients/dto/ingredient-response.dto.ts";
import type { CreateIngredientDto } from "../../catalog-service/ingredients/dto/create-ingredient.dto.ts";
import type { UpdateIngredientDto } from "../../catalog-service/ingredients/dto/update-ingredient.dto.ts";
import { PaginatedResponseDto } from "../../../libs/pagination/paginated-response.dto.ts";
export declare class CatalogClient {
    private readonly client;
    constructor(client: ClientProxy);
    findAll(page: number, limit: number, search?: string): Promise<PaginatedResponseDto<PizzaResponseDto>>;
    findById(id: string): Promise<PizzaResponseDto>;
    create(dto: CreatePizzaDto): Promise<PizzaResponseDto>;
    update(id: string, dto: UpdatePizzaDto): Promise<PizzaResponseDto>;
    setImagePath(id: string, imagePath: string): Promise<PizzaResponseDto>;
    remove(id: string): Promise<{
        ok: true;
    }>;
    findAllIngredients(): Promise<IngredientResponseDto[]>;
    findIngredientById(id: string): Promise<IngredientResponseDto>;
    createIngredient(dto: CreateIngredientDto): Promise<IngredientResponseDto>;
    updateIngredient(id: string, dto: UpdateIngredientDto): Promise<IngredientResponseDto>;
    removeIngredient(id: string): Promise<{
        ok: true;
    }>;
}
