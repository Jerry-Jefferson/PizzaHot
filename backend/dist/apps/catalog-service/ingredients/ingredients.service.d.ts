import type { IIngredientsRepository } from "./ingredient.types.ts";
import { CreateIngredientDto } from "./dto/create-ingredient.dto.ts";
import { UpdateIngredientDto } from "./dto/update-ingredient.dto.ts";
import { IngredientResponseDto } from "./dto/ingredient-response.dto.ts";
export declare class IngredientsService {
    private readonly ingredientsRepository;
    private readonly logger;
    constructor(ingredientsRepository: IIngredientsRepository);
    create(dto: CreateIngredientDto): Promise<IngredientResponseDto>;
    findAll(): Promise<IngredientResponseDto[]>;
    findById(id: string): Promise<IngredientResponseDto>;
    validateIds(ids: string[]): Promise<void>;
    update(id: string, dto: UpdateIngredientDto): Promise<IngredientResponseDto>;
    remove(id: string): Promise<void>;
}
