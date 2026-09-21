import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiGetMostOrderedPizza, ApiGetUsersAboveAverageCheck } from "./analytics.api-docs.ts";
import { ApiOwnerOnly } from "../../../libs/swagger/api-responses.decorator.ts";
import { AnalyticsClient } from "../clients/analytics.client.ts";
import { ZodValidationPipe } from "../../../libs/validation/zod-validation.pipe.ts";
import { mostOrderedPizzaQuerySchema } from "../../analytics-service/analytics.schema.ts";
import { Can } from "../../../libs/auth/decorators/can.decorator.ts";
import { Permission } from "../../../libs/auth/permission.constant.ts";

@ApiTags("Analytics")
@ApiBearerAuth()
@ApiOwnerOnly()
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsClient) {}

  @Get("popular-pizza")
  @Can(Permission.ANALYTICS_READ)
  @ApiGetMostOrderedPizza()
  async getMostOrderedPizza(
    @Query(new ZodValidationPipe(mostOrderedPizzaQuerySchema))
    query: {
      month: number;
      year: number;
    }
  ) {
    return this.analyticsService.getMostOrderedPizzaInMonth(query.month, query.year);
  }

  @Get("highest-checks")
  @Can(Permission.ANALYTICS_READ)
  @ApiGetUsersAboveAverageCheck()
  async getUsersAboveAverageCheck() {
    return this.analyticsService.getUsersWithAboveAverageCheck();
  }
}
