import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AnalyticsClient } from "../clients/analytics.client.ts";
import { Roles } from "../../../libs/auth/decorators/roles.decorator.ts";
import { Role } from "../../../libs/common/constants/role.enum.ts";
import { ZodValidationPipe } from "../../../libs/common/pipes/zod-validation.pipe.ts";
import { mostOrderedPizzaQuerySchema } from "../../analytics-service/analytics/schemas/analytics.schema.ts";

@ApiTags("Analytics")
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsClient) {}

  @Get("popular-pizza")
  @ApiOperation({ summary: "Get the most ordered pizza in a given month (Admin only)" })
  @ApiQuery({
    name: "month",
    required: true,
    type: Number,
    example: 9,
    description: "Month (1-12)",
  })
  @ApiQuery({ name: "year", required: true, type: Number, example: 2026, description: "Year" })
  @ApiResponse({
    status: 200,
    description: "Most ordered pizza with name and total quantity, or null if no orders found",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions" })
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
  @ApiOperation({
    summary:
      "Get users (with >3 orders) whose average check exceeds the global average (Admin only)",
  })
  @ApiResponse({
    status: 200,
    description:
      "Array of users with userId, email, name, orderCount, averageCheck, globalAverageCheck",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions" })
  async getUsersAboveAverageCheck() {
    return this.analyticsService.getUsersWithAboveAverageCheck();
  }
}
