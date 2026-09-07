import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from "@nestjs/common";
import { IngredientsService } from "./ingredients.service.ts";
import { CreateIngredientDto } from "./dto/create-ingredient.dto.ts";
import { UpdateIngredientDto } from "./dto/update-ingredient.dto.ts";
import { IngredientResponseDto } from "./dto/ingredient-response.dto.ts";
import { Roles } from "../auth/decorators/roles.decorator.ts";
import { Role } from "../shared/constants/role.enum.ts";
import { ZodValidationPipe } from "../shared/pipes/zod-validation.pipe.ts";
import { ingredientSchema, updateIngredientSchema } from "./schemas/ingredient.schema.ts";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("Ingredients")
@ApiBearerAuth()
@Controller("ingredients")
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Create a new ingredient (Admin only)" })
  @ApiBody({ type: CreateIngredientDto })
  @ApiResponse({
    status: 201,
    description: "Ingredient successfully created",
    type: IngredientResponseDto,
  })
  async create(
    @Body(new ZodValidationPipe(ingredientSchema)) dto: CreateIngredientDto
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.ingredientsService.create(dto);
    return IngredientResponseDto.fromEntity(ingredient);
  }

  @Get()
  @ApiOperation({ summary: "Get all ingredients" })
  @ApiResponse({ status: 200, description: "List of ingredients", type: [IngredientResponseDto] })
  async findAll(): Promise<IngredientResponseDto[]> {
    const ingredients = await this.ingredientsService.findAll();
    return ingredients.map((ingredient) => IngredientResponseDto.fromEntity(ingredient));
  }

  @Get(":id")
  @ApiOperation({ summary: "Get ingredient by ID" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiResponse({ status: 200, description: "Ingredient found", type: IngredientResponseDto })
  @ApiResponse({ status: 404, description: "Ingredient not found" })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<IngredientResponseDto> {
    const ingredient = await this.ingredientsService.findById(id);
    return IngredientResponseDto.fromEntity(ingredient);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Update an ingredient by ID (Admin only)" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiBody({ type: UpdateIngredientDto })
  @ApiResponse({
    status: 200,
    description: "Ingredient successfully updated",
    type: IngredientResponseDto,
  })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateIngredientSchema)) dto: UpdateIngredientDto
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.ingredientsService.update(id, dto);
    return IngredientResponseDto.fromEntity(ingredient);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Delete an ingredient by ID (Admin only)" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiResponse({ status: 200, description: "Ingredient successfully deleted" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.ingredientsService.remove(id);
  }
}
