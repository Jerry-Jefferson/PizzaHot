import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../libs/auth/decorators/roles.decorator.ts";
import { Role } from "../../../libs/common/constants/role.enum.ts";
import { ZodValidationPipe } from "../../../libs/common/pipes/zod-validation.pipe.ts";
import { LogClient } from "../clients/analytics.client.ts";
import {
  type ListLogsQuery,
  listLogsQuerySchema,
} from "../../log-service/logs/schemas/log-query.schema.ts";
import { LogLevel } from "../../../libs/logging/log-level.enum.ts";

@ApiTags("Logs")
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogClient) {}

  @Get()
  @ApiOperation({ summary: "Get paginated system logs with optional level filter (Admin only)" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    example: 1,
    description: "Page number (defaults to 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    example: 10,
    description: "Items per page (defaults to 10, max 100)",
  })
  @ApiQuery({
    name: "level",
    required: false,
    enum: LogLevel,
    description: "Filter by log level (info, error)",
  })
  @ApiQuery({
    name: "context",
    required: false,
    type: String,
    description: "Filter by log context (e.g. HTTP, CriticalErrorFilter)",
  })
  @ApiResponse({
    status: 200,
    description: "Paginated list of logs",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions" })
  async getLogs(@Query(new ZodValidationPipe(listLogsQuerySchema)) query: ListLogsQuery) {
    return this.logsService.findAll(query);
  }
}
