import { applyDecorators } from "@nestjs/common";
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { PaginatedResponseDto } from "../../../../libs/pagination/paginated-response.dto.ts";
import { CreatePizzaDto } from "../../../catalog-service/pizzas/dto/create-pizza.dto.ts";
import { UpdatePizzaDto } from "../../../catalog-service/pizzas/dto/update-pizza.dto.ts";
import { PizzaResponseDto } from "../../../catalog-service/pizzas/dto/pizza-response.dto.ts";
import {
  ApiCreated,
  ApiDeleted,
  ApiNotFound,
  ApiUpdated,
} from "../../../../libs/swagger/api-crud.decorator.ts";
import {
  ApiAdminOnly,
  ApiPaginationQuery,
} from "../../../../libs/swagger/api-responses.decorator.ts";

export const ApiFindAllPizza = () =>
  applyDecorators(
    ApiOperation({ summary: "Get all pizzas (paginated)" }),
    ApiPaginationQuery(),
    ApiQuery({ name: "search", required: false, type: String }),
    ApiResponse({
      status: 200,
      description: "Paginated list of pizzas",
      type: PaginatedResponseDto,
    })
  );

export const ApiFindOnePizza = () =>
  applyDecorators(
    ApiOperation({ summary: "Get pizza by ID" }),
    ApiParam({ name: "id", type: "string", format: "uuid" }),
    ApiResponse({ status: 200, description: "Pizza found", type: PizzaResponseDto }),
    ApiNotFound("Pizza")
  );

export const ApiAddPizza = () =>
  applyDecorators(
    ApiOperation({ summary: "Add a new pizza (Admin only)" }),
    ApiBody({ description: "Pizza creation payload", type: CreatePizzaDto }),
    ApiCreated("Pizza", PizzaResponseDto),
    ApiResponse({ status: 400, description: "Bad request - invalid data" }),
    ApiAdminOnly(),
    ApiResponse({ status: 409, description: "Conflict - Pizza name already exists" })
  );

export const ApiUpdatePizza = () =>
  applyDecorators(
    ApiOperation({ summary: "Update a pizza by ID (Admin only)" }),
    ApiParam({ name: "id", type: "string", format: "uuid" }),
    ApiBody({ description: "Pizza update payload", type: UpdatePizzaDto }),
    ApiUpdated("Pizza", PizzaResponseDto),
    ApiResponse({ status: 400, description: "Bad request - invalid data" }),
    ApiAdminOnly(),
    ApiNotFound("Pizza"),
    ApiResponse({ status: 409, description: "Conflict - Pizza name already exists" })
  );

export const ApiUploadImagePizza = () =>
  applyDecorators(
    ApiOperation({ summary: "Upload or replace a pizza image (Admin only)" }),
    ApiConsumes("multipart/form-data"),
    ApiParam({ name: "id", type: "string", format: "uuid" }),
    ApiBody({
      description: "Pizza image file",
      schema: {
        type: "object",
        required: ["image"],
        properties: {
          image: {
            type: "string",
            format: "binary",
            description: "Pizza image file (jpeg, png, webp)",
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: "Image successfully uploaded",
      type: PizzaResponseDto,
    }),
    ApiResponse({ status: 400, description: "Bad request - invalid file" }),
    ApiAdminOnly(),
    ApiNotFound("Pizza")
  );

export const ApiRemovePizza = () =>
  applyDecorators(
    ApiOperation({ summary: "Delete a pizza by ID (Admin only)" }),
    ApiParam({ name: "id", type: "string", format: "uuid" }),
    ApiDeleted("Pizza"),
    ApiAdminOnly(),
    ApiNotFound("Pizza")
  );
