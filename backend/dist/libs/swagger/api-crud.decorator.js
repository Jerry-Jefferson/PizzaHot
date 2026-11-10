import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
export function ApiCreated(resource, type) {
    return applyDecorators(ApiResponse({
        status: 201,
        description: `${resource} successfully created`,
        ...(type && { type }),
    }));
}
export function ApiUpdated(resource, type) {
    return applyDecorators(ApiResponse({
        status: 200,
        description: `${resource} successfully updated`,
        ...(type && { type }),
    }));
}
export function ApiDeleted(resource, options = {}) {
    const { status = 204, note } = options;
    const description = note
        ? `${resource} successfully deleted (${note})`
        : `${resource} successfully deleted`;
    return applyDecorators(ApiResponse({ status, description }));
}
export function ApiNotFound(resource) {
    return applyDecorators(ApiResponse({ status: 404, description: `${resource} not found` }));
}
//# sourceMappingURL=api-crud.decorator.js.map