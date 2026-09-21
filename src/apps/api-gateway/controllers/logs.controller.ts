import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiGetLogs } from "./logs.api-docs.ts";
import { ApiOwnerOnly } from "../../../libs/swagger/api-responses.decorator.ts";
import { ZodValidationPipe } from "../../../libs/validation/zod-validation.pipe.ts";
import { LogClient } from "../clients/analytics.client.ts";
import {
  listLogsQuerySchema,
  type ListLogsQuery,
} from "../../log-service/schemas/log-query.schema.ts";
import { Can } from "../../../libs/auth/decorators/can.decorator.ts";
import { Permission } from "../../../libs/auth/permission.constant.ts";

@ApiTags("Logs")
@ApiBearerAuth()
@ApiOwnerOnly()
@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogClient) {}

  @Get()
  @Can(Permission.LOG_READ)
  @ApiGetLogs()
  async getLogs(@Query(new ZodValidationPipe(listLogsQuerySchema)) query: ListLogsQuery) {
    return this.logsService.findAll(query);
  }
}
