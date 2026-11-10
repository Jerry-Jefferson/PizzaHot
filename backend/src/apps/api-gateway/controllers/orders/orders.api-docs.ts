import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import {
  ApiCreated,
  ApiNotFound,
  ApiUpdated,
} from "../../../../libs/swagger/api-crud.decorator.ts";
import {
  ApiAuth,
  ApiOwnerOnly,
  ApiPaginationQuery,
} from "../../../../libs/swagger/api-responses.decorator.ts";
import { CreateOrderDto } from "../../../order-service/dto/create-order.dto.ts";
import { UpdateOrderStatusDto } from "../../../order-service/dto/update-order-status.dto.ts";
import { ListOrdersQueryDto } from "../../../order-service/dto/list-orders-query.dto.ts";
import { OrderResponseDto } from "../../../order-service/dto/order-response.dto.ts";
import { PaginatedResponseDto } from "../../../../libs/pagination/paginated-response.dto.ts";

export const ApiCreateOrder = () =>
  applyDecorators(
    ApiOperation({ summary: "Create a new order (Checkout cart)" }),
    ApiBody({ type: CreateOrderDto }),
    ApiCreated("Order", OrderResponseDto),
    ApiResponse({
      status: 400,
      description: "Bad request (e.g. cart empty, invalid delivery address)",
    }),
    ApiAuth(),
    ApiNotFound("Promocode or Pizza")
  );

export const ApiGetMyOrders = () =>
  applyDecorators(
    ApiOperation({ summary: "Get all orders for the current user" }),
    ApiPaginationQuery(),
    ApiResponse({ status: 200, description: "Paginated user orders", type: PaginatedResponseDto }),
    ApiAuth()
  );

export const ApiGetMyOrderByIdOrder = () =>
  applyDecorators(
    ApiOperation({ summary: "Get a specific order of the current user" }),
    ApiParam({ name: "id", type: "string", format: "uuid" }),
    ApiResponse({ status: 200, description: "Order details", type: OrderResponseDto }),
    ApiAuth(),
    ApiNotFound("Order")
  );

export const ApiSearchOrders = () =>
  applyDecorators(
    ApiOperation({
      summary: "Search orders (Admin only)",
      description:
        "Reads only - the filter travels in the body instead of the query string. The body may be omitted for the unfiltered first page.",
    }),
    ApiBody({ type: ListOrdersQueryDto, required: false }),
    ApiResponse({ status: 200, description: "Paginated orders list", type: PaginatedResponseDto }),
    ApiOwnerOnly()
  );

export const ApiGetOrdersByUserOrder = () =>
  applyDecorators(
    ApiOperation({ summary: "Get all orders by a particular user (Admin only)" }),
    ApiParam({ name: "userId", type: "string", format: "uuid" }),
    ApiPaginationQuery(),
    ApiResponse({ status: 200, description: "Paginated user orders", type: PaginatedResponseDto }),
    ApiOwnerOnly()
  );

export const ApiGetOrderByIdOrder = () =>
  applyDecorators(
    ApiOperation({ summary: "Get 1 order by its ID (Admin only)" }),
    ApiParam({ name: "id", type: "string", format: "uuid" }),
    ApiResponse({ status: 200, description: "Order details", type: OrderResponseDto }),
    ApiOwnerOnly(),
    ApiNotFound("Order")
  );

export const ApiUpdateStatusOrder = () =>
  applyDecorators(
    ApiOperation({ summary: "Update only status of the order (Admin only)" }),
    ApiParam({ name: "id", type: "string", format: "uuid" }),
    ApiBody({ type: UpdateOrderStatusDto }),
    ApiUpdated("Order status", OrderResponseDto),
    ApiResponse({ status: 400, description: "Invalid status" }),
    ApiOwnerOnly(),
    ApiNotFound("Order")
  );
