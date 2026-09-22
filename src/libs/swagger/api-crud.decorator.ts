import { applyDecorators, type Type } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export function ApiCreated(resource: string, type?: Type<unknown>) {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: `${resource} successfully created`,
      ...(type && { type }),
    })
  );
}

export function ApiUpdated(resource: string, type?: Type<unknown>) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: `${resource} successfully updated`,
      ...(type && { type }),
    })
  );
}

export function ApiDeleted(resource: string, options: { status?: number; note?: string } = {}) {
  const { status = 204, note } = options;
  const description = note
    ? `${resource} successfully deleted (${note})`
    : `${resource} successfully deleted`;

  return applyDecorators(ApiResponse({ status, description }));
}

export function ApiNotFound(resource: string) {
  return applyDecorators(ApiResponse({ status: 404, description: `${resource} not found` }));
}
