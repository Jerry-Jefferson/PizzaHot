import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { LogLevel } from "../../../../libs/logging/log-level.constant.js";
export const ApiGetLogs = () => applyDecorators(ApiOperation({ summary: "Get paginated system logs with optional level filter (Admin only)" }), ApiQuery({
    name: "page",
    required: false,
    type: Number,
    example: 1,
    description: "Page number (defaults to 1)",
}), ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    example: 10,
    description: "Items per page (defaults to 10, max 100)",
}), ApiQuery({
    name: "level",
    required: false,
    enum: LogLevel,
    description: "Filter by log level (info, error)",
}), ApiQuery({
    name: "context",
    required: false,
    type: String,
    description: "Filter by log context (e.g. HTTP, CriticalErrorFilter)",
}), ApiResponse({
    status: 200,
    description: "Paginated list of logs",
}));
//# sourceMappingURL=logs.api-docs.js.map