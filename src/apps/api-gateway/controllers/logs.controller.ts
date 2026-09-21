import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiGetLogs } from "./logs.api-docs.ts";
import { ApiOwnerOnly } from "../../../libs/common/swagger/api-responses.decorator.ts";
import { Roles } from "../../../libs/auth/decorators/roles.decorator.ts";
import { Role } from "../../../libs/common/constants/role.constant.ts";
import { ZodValidationPipe } from "../../../libs/common/pipes/zod-validation.pipe.ts";
import { LogClient } from "../clients/analytics.client.ts";
import {
  listLogsQuerySchema,
  type ListLogsQuery,
} from "../../log-service/schemas/log-query.schema.ts";

@ApiTags("Logs")
@ApiBearerAuth()
@Roles(Role.ADMIN)
@ApiOwnerOnly()
@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogClient) {}

  @Get()
  @ApiGetLogs()
  async getLogs(@Query(new ZodValidationPipe(listLogsQuerySchema)) query: ListLogsQuery) {
    return this.logsService.findAll(query);
  }
}
