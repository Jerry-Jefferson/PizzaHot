import { applyDecorators } from "@nestjs/common";
import { ApiQuery, ApiResponse } from "@nestjs/swagger";
export function ApiAuth() {
    return applyDecorators(ApiResponse({ status: 401, description: "Unauthorized" }));
}
export function ApiAdminOnly() {
    return applyDecorators(ApiAuth(), ApiResponse({ status: 403, description: "Forbidden - Admin role required" }));
}
export function ApiOwnerOnly() {
    return applyDecorators(ApiAuth(), ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions" }));
}
export function ApiPaginationQuery() {
    return applyDecorators(ApiQuery({ name: "page", required: false, type: Number, example: 1 }), ApiQuery({ name: "limit", required: false, type: Number, example: 10 }));
}
//# sourceMappingURL=api-responses.decorator.js.map