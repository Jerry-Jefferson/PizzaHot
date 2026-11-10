import { CatalogClient } from "../../clients/catalog.client.ts";
import { CreateIngredientDto } from "../../../catalog-service/ingredients/dto/create-ingredient.dto.ts";
import { UpdateIngredientDto } from "../../../catalog-service/ingredients/dto/update-ingredient.dto.ts";
import { IngredientResponseDto } from "../../../catalog-service/ingredients/dto/ingredient-response.dto.ts";
export declare class IngredientsController {
    private readonly ingredientsService;
    constructor(ingredientsService: CatalogClient);
    create(dto: CreateIngredientDto): Promise<IngredientResponseDto>;
    findAll(): Promise<IngredientResponseDto[]>;
    findOne(id: string): Promise<IngredientResponseDto>;
    update(id: string, dto: UpdateIngredientDto): Promise<IngredientResponseDto>;
    remove(id: string): Promise<void>;
}
