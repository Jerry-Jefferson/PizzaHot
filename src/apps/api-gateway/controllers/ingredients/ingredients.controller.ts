import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CatalogClient } from "../../clients/catalog.client.ts";
import { CreateIngredientDto } from "../../../catalog-service/ingredients/dto/create-ingredient.dto.ts";
import { UpdateIngredientDto } from "../../../catalog-service/ingredients/dto/update-ingredient.dto.ts";
import { IngredientResponseDto } from "../../../catalog-service/ingredients/dto/ingredient-response.dto.ts";
import { ZodValidationPipe } from "../../../../libs/validation/zod-validation.pipe.ts";
import {
  ingredientSchema,
  updateIngredientSchema,
} from "../../../catalog-service/ingredients/ingredient.schema.ts";
import {
  ApiCreateIngredient,
  ApiDeleteIngredient,
  ApiGetIngredient,
  ApiListIngredients,
  ApiUpdateIngredient,
} from "./ingredients.api-docs.ts";
import { Can } from "../../../../libs/auth/decorators/can.decorator.ts";
import { Permission } from "../../../../libs/auth/permission.constant.ts";

@ApiTags("Ingredients")
@ApiBearerAuth()
@Controller("ingredients")
export class IngredientsController {
  constructor(private readonly ingredientsService: CatalogClient) {}

  @Post()
  @Can(Permission.INGREDIENT_WRITE)
  @ApiCreateIngredient()
  async create(
    @Body(new ZodValidationPipe(ingredientSchema)) dto: CreateIngredientDto
  ): Promise<IngredientResponseDto> {
    return this.ingredientsService.createIngredient(dto);
  }

  @Get()
  @Can(Permission.INGREDIENT_READ)
  @ApiListIngredients()
  async findAll(): Promise<IngredientResponseDto[]> {
    return this.ingredientsService.findAllIngredients();
  }

  @Get(":id")
  @Can(Permission.INGREDIENT_READ)
  @ApiGetIngredient()
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<IngredientResponseDto> {
    return this.ingredientsService.findIngredientById(id);
  }

  @Patch(":id")
  @Can(Permission.INGREDIENT_WRITE)
  @ApiUpdateIngredient()
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateIngredientSchema)) dto: UpdateIngredientDto
  ): Promise<IngredientResponseDto> {
    return this.ingredientsService.updateIngredient(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Can(Permission.INGREDIENT_DELETE)
  @ApiDeleteIngredient()
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.ingredientsService.removeIngredient(id);
  }
}
