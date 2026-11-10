import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { CreatePromocodeDto } from "../../../promocode-service/dto/create-promocode.dto.js";
import { UpdatePromocodeDto } from "../../../promocode-service/dto/update-promocode.dto.js";
import { PromocodeResponseDto } from "../../../promocode-service/dto/promocode-response.dto.js";
import { ApiDeleted } from "../../../../libs/swagger/api-crud.decorator.js";
import { ApiCreated, ApiNotFound, ApiUpdated, } from "../../../../libs/swagger/api-crud.decorator.js";
export const ApiCreatePromocode = () => applyDecorators(ApiOperation({ summary: "Create a new promocode (Admin only)" }), ApiBody({ type: CreatePromocodeDto }), ApiCreated("Promocode", PromocodeResponseDto), ApiResponse({ status: 400, description: "Bad request" }), ApiResponse({ status: 409, description: "Promocode with this code already exists" }));
export const ApiFindAllPromocode = () => applyDecorators(ApiOperation({ summary: "Get all promocodes (Admin only)" }), ApiResponse({
    status: 200,
    description: "List of promocodes",
    type: [PromocodeResponseDto],
}));
export const ApiFindOnePromocode = () => applyDecorators(ApiOperation({ summary: "Get promocode by ID (Admin only)" }), ApiParam({ name: "id", type: "string", format: "uuid" }), ApiResponse({
    status: 200,
    description: "Promocode found",
    type: PromocodeResponseDto,
}), ApiNotFound("Promocode"));
export const ApiUpdatePromocode = () => applyDecorators(ApiOperation({
    summary: "Replace a promocode by ID (Admin only)",
    description: "Replaces the whole resource: a field the body leaves out is cleared, not kept. Use this to set the full state, not to amend one field.",
}), ApiParam({ name: "id", type: "string", format: "uuid" }), ApiBody({ type: UpdatePromocodeDto }), ApiUpdated("Promocode", PromocodeResponseDto), ApiResponse({ status: 400, description: "Bad request" }), ApiNotFound("Promocode"), ApiResponse({ status: 409, description: "Promocode with this code already exists" }));
export const ApiRemovePromocode = () => applyDecorators(ApiOperation({ summary: "Soft delete a promocode by ID (Admin only)" }), ApiParam({ name: "id", type: "string", format: "uuid" }), ApiDeleted("Promocode", { note: "soft delete" }), ApiNotFound("Promocode"));
export const ApiRestorePromocode = () => applyDecorators(ApiOperation({ summary: "Restore a soft-deleted promocode by ID (Admin only)" }), ApiParam({ name: "id", type: "string", format: "uuid" }), ApiResponse({
    status: 200,
    description: "Promocode successfully restored",
    type: PromocodeResponseDto,
}), ApiNotFound("Promocode"));
//# sourceMappingURL=promocodes.api-docs.js.map