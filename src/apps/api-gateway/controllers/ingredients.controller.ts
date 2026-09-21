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
import { CatalogClient } from "../clients/catalog.client.ts";
import { CreateIngredientDto } from "../../catalog-service/ingredients/dto/create-ingredient.dto.ts";
import { UpdateIngredientDto } from "../../catalog-service/ingredients/dto/update-ingredient.dto.ts";
import { IngredientResponseDto } from "../../catalog-service/ingredients/dto/ingredient-response.dto.ts";
import { Roles } from "../../../libs/auth/decorators/roles.decorator.ts";
import { Role } from "../../../libs/auth/auth.constant.ts";
import { ZodValidationPipe } from "../../../libs/validation/zod-validation.pipe.ts";
import {
  ingredientSchema,
  updateIngredientSchema,
} from "../../catalog-service/ingredients/ingredient.schema.ts";
import {
  ApiCreateIngredient,
  ApiDeleteIngredient,
  ApiGetIngredient,
  ApiListIngredients,
  ApiUpdateIngredient,
} from "./ingredients.api-docs.ts";

@ApiTags("Ingredients")
@ApiBearerAuth()
@Controller("ingredients")
export class IngredientsController {
  constructor(private readonly ingredientsService: CatalogClient) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiCreateIngredient()
  async create(
    @Body(new ZodValidationPipe(ingredientSchema)) dto: CreateIngredientDto
  ): Promise<IngredientResponseDto> {
    return this.ingredientsService.createIngredient(dto);
  }

  @Get()
  @ApiListIngredients()
  async findAll(): Promise<IngredientResponseDto[]> {
    return this.ingredientsService.findAllIngredients();
  }

  @Get(":id")
  @ApiGetIngredient()
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<IngredientResponseDto> {
    return this.ingredientsService.findIngredientById(id);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @ApiUpdateIngredient()
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateIngredientSchema)) dto: UpdateIngredientDto
  ): Promise<IngredientResponseDto> {
    return this.ingredientsService.updateIngredient(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  @ApiDeleteIngredient()
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.ingredientsService.removeIngredient(id);
  }
}
