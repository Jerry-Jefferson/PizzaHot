import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiGetMostOrderedPizza, ApiGetUsersAboveAverageCheck } from "./analytics.api-docs.ts";
import { ApiOwnerOnly } from "../../../libs/swagger/api-responses.decorator.ts";
import { AnalyticsClient } from "../clients/analytics.client.ts";
import { Roles } from "../../../libs/auth/decorators/roles.decorator.ts";
import { Role } from "../../../libs/auth/auth.constant.ts";
import { ZodValidationPipe } from "../../../libs/validation/zod-validation.pipe.ts";
import { mostOrderedPizzaQuerySchema } from "../../analytics-service/analytics.schema.ts";

@ApiTags("Analytics")
@ApiBearerAuth()
@Roles(Role.ADMIN)
@ApiOwnerOnly()
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsClient) {}

  @Get("popular-pizza")
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
  @ApiGetUsersAboveAverageCheck()
  async getUsersAboveAverageCheck() {
    return this.analyticsService.getUsersWithAboveAverageCheck();
  }
}
