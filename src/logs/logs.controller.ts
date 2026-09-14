import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator.ts";
import { Role } from "../shared/constants/role.enum.ts";
import { ZodValidationPipe } from "../shared/pipes/zod-validation.pipe.ts";
import { LogsService } from "./logs.service.ts";
import { type ListLogsQuery, listLogsQuerySchema } from "./schemas/log-query.schema.ts";
import { LogLevel } from "./constants/log-level.enum.ts";

@ApiTags("Logs")
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

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
