import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";

export const ApiGetMostOrderedPizza = () =>
  applyDecorators(
    ApiOperation({ summary: "Get the most ordered pizza in a given month (Admin only)" }),
    ApiQuery({
      name: "month",
      required: true,
      type: Number,
      example: 9,
      description: "Month (1-12)",
    }),
    ApiQuery({ name: "year", required: true, type: Number, example: 2026, description: "Year" }),
    ApiResponse({
      status: 200,
      description: "Most ordered pizza with name and total quantity, or null if no orders found",
    })
  );

export const ApiGetUsersAboveAverageCheck = () =>
  applyDecorators(
    ApiOperation({
      summary:
        "Get users (with >3 orders) whose average check exceeds the global average (Admin only)",
    }),
    ApiResponse({
      status: 200,
      description:
        "Array of users with userId, email, name, orderCount, averageCheck, globalAverageCheck",
    })
  );
