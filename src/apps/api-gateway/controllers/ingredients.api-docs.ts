import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { CreateIngredientDto } from "../../catalog-service/ingredients/dto/create-ingredient.dto.ts";
import { UpdateIngredientDto } from "../../catalog-service/ingredients/dto/update-ingredient.dto.ts";
import { IngredientResponseDto } from "../../catalog-service/ingredients/dto/ingredient-response.dto.ts";
import {
  ApiCreated,
  ApiDeleted,
  ApiNotFound,
  ApiUpdated,
} from "../../../libs/common/swagger/api-crud.decorator.ts";

export const ApiCreateIngredient = () =>
  applyDecorators(
    ApiOperation({ summary: "Create a new ingredient (Admin only)" }),
    ApiBody({ type: CreateIngredientDto }),
    ApiCreated("Ingredient", IngredientResponseDto)
  );

export const ApiListIngredients = () =>
  applyDecorators(
    ApiOperation({ summary: "Get all ingredients" }),
    ApiResponse({ status: 200, description: "List of ingredients", type: [IngredientResponseDto] })
  );

export const ApiGetIngredient = () =>
  applyDecorators(
    ApiOperation({ summary: "Get ingredient by ID" }),
    ApiParam({ name: "id", type: "string", format: "uuid" }),
    ApiResponse({ status: 200, description: "Ingredient found", type: IngredientResponseDto }),
    ApiNotFound("Ingredient")
  );

export const ApiUpdateIngredient = () =>
  applyDecorators(
    ApiOperation({ summary: "Update an ingredient by ID (Admin only)" }),
    ApiParam({ name: "id", type: "string", format: "uuid" }),
    ApiBody({ type: UpdateIngredientDto }),
    ApiUpdated("Ingredient", IngredientResponseDto)
  );

export const ApiDeleteIngredient = () =>
  applyDecorators(
    ApiOperation({ summary: "Delete an ingredient by ID (Admin only)" }),
    ApiParam({ name: "id", type: "string", format: "uuid" }),
    ApiDeleted("Ingredient")
  );
