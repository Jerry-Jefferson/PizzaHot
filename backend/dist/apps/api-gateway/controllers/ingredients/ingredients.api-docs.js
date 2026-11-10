import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { CreateIngredientDto } from "../../../catalog-service/ingredients/dto/create-ingredient.dto.js";
import { UpdateIngredientDto } from "../../../catalog-service/ingredients/dto/update-ingredient.dto.js";
import { IngredientResponseDto } from "../../../catalog-service/ingredients/dto/ingredient-response.dto.js";
import { ApiCreated, ApiDeleted, ApiNotFound, ApiUpdated, } from "../../../../libs/swagger/api-crud.decorator.js";
import { ApiAdminOnly } from "../../../../libs/swagger/api-responses.decorator.js";
export const ApiCreateIngredient = () => applyDecorators(ApiOperation({ summary: "Create a new ingredient (Admin only)" }), ApiBody({ type: CreateIngredientDto }), ApiCreated("Ingredient", IngredientResponseDto), ApiAdminOnly());
export const ApiListIngredients = () => applyDecorators(ApiOperation({ summary: "Get all ingredients" }), ApiResponse({ status: 200, description: "List of ingredients", type: [IngredientResponseDto] }));
export const ApiGetIngredient = () => applyDecorators(ApiOperation({ summary: "Get ingredient by ID" }), ApiParam({ name: "id", type: "string", format: "uuid" }), ApiResponse({ status: 200, description: "Ingredient found", type: IngredientResponseDto }), ApiNotFound("Ingredient"));
export const ApiUpdateIngredient = () => applyDecorators(ApiOperation({
    summary: "Replace an ingredient by ID (Admin only)",
    description: "Replaces the whole resource: a field the body leaves out is cleared, not kept. Use this to set the full state, not to amend one field.",
}), ApiParam({ name: "id", type: "string", format: "uuid" }), ApiBody({ type: UpdateIngredientDto }), ApiUpdated("Ingredient", IngredientResponseDto), ApiAdminOnly());
export const ApiDeleteIngredient = () => applyDecorators(ApiOperation({ summary: "Delete an ingredient by ID (Admin only)" }), ApiParam({ name: "id", type: "string", format: "uuid" }), ApiDeleted("Ingredient"), ApiAdminOnly());
//# sourceMappingURL=ingredients.api-docs.js.map