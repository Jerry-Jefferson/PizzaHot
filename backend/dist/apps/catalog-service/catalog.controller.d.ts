import type { ClientProxy } from "@nestjs/microservices";
import { RmqContext } from "@nestjs/microservices";
import type { OrderCreatedEvent, ResolvedPizza } from "../../libs/contracts/index.ts";
import type { IPizzasRepository } from "./pizzas/pizza.types.ts";
import { PizzasService } from "./pizzas/pizzas.service.ts";
import { IngredientsService } from "./ingredients/ingredients.service.ts";
import { PizzaResponseDto } from "./pizzas/dto/pizza-response.dto.ts";
import { IngredientResponseDto } from "./ingredients/dto/ingredient-response.dto.ts";
import type { CreatePizzaDto } from "./pizzas/dto/create-pizza.dto.ts";
import type { UpdatePizzaDto } from "./pizzas/dto/update-pizza.dto.ts";
import type { CreateIngredientDto } from "./ingredients/dto/create-ingredient.dto.ts";
import type { UpdateIngredientDto } from "./ingredients/dto/update-ingredient.dto.ts";
import type { PaginatedResult } from "../../libs/pagination/pagination.types.ts";
export declare class CatalogMessagesController {
    private readonly pizzas;
    private readonly ingredients;
    private readonly pizzasRepository;
    private readonly events;
    private readonly logger;
    constructor(pizzas: PizzasService, ingredients: IngredientsService, pizzasRepository: IPizzasRepository, events: ClientProxy);
    list(payload: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<PaginatedResult<PizzaResponseDto>>;
    findById(payload: {
        id: string;
    }): Promise<PizzaResponseDto>;
    create(payload: CreatePizzaDto): Promise<PizzaResponseDto>;
    update(payload: {
        id: string;
        dto: UpdatePizzaDto;
    }): Promise<PizzaResponseDto>;
    setImage(payload: {
        id: string;
        imagePath: string;
    }): Promise<PizzaResponseDto>;
    remove(payload: {
        id: string;
    }): Promise<{
        ok: true;
    }>;
    resolve(payload: {
        pizzaIds: string[];
    }): Promise<ResolvedPizza[]>;
    listIngredients(): Promise<IngredientResponseDto[]>;
    findIngredient(payload: {
        id: string;
    }): Promise<IngredientResponseDto>;
    createIngredient(payload: CreateIngredientDto): Promise<IngredientResponseDto>;
    updateIngredient(payload: {
        id: string;
        dto: UpdateIngredientDto;
    }): Promise<IngredientResponseDto>;
    removeIngredient(payload: {
        id: string;
    }): Promise<{
        ok: true;
    }>;
    onOrderCreated(event: OrderCreatedEvent, context: RmqContext): Promise<void>;
}
