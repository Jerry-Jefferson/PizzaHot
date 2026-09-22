import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { ApiNotFound } from "../../../../libs/swagger/api-crud.decorator.ts";
import { AddCartItemDto } from "../../../cart-service/cart-items/dto/add-cart-item.dto.ts";
import { UpdateCartItemDto } from "../../../cart-service/cart-items/dto/update-cart-item.dto.ts";
import { ApplyPromocodeDto } from "../../../cart-service/dto/apply-promocode.dto.ts";
import { CartResponseDto } from "../../../cart-service/dto/cart-response.dto.ts";

export const ApiGetCart = () =>
  applyDecorators(
    ApiOperation({ summary: "Get the current user's cart" }),
    ApiResponse({
      status: 200,
      description: "Cart with items and price calculation",
      type: CartResponseDto,
    })
  );

export const ApiApplyPromocodeCart = () =>
  applyDecorators(
    ApiOperation({ summary: "Apply a promocode to the cart" }),
    ApiBody({ description: "Promocode to apply", type: ApplyPromocodeDto }),
    ApiResponse({ status: 200, description: "Promocode applied to cart", type: CartResponseDto }),
    ApiResponse({ status: 400, description: "Promocode expired or already applied" }),
    ApiNotFound("Promocode")
  );

export const ApiRemovePromocodeCart = () =>
  applyDecorators(
    ApiOperation({ summary: "Remove the promocode from the cart" }),
    ApiResponse({ status: 200, description: "Promocode removed from cart", type: CartResponseDto }),
    ApiNotFound("Cart or applied promocode")
  );

export const ApiAddItemCart = () =>
  applyDecorators(
    ApiOperation({ summary: "Add a pizza to the cart" }),
    ApiBody({ description: "Pizza to add", type: AddCartItemDto }),
    ApiResponse({ status: 201, description: "Item added to cart" }),
    ApiNotFound("Pizza")
  );

export const ApiUpdateItemQuantityCart = () =>
  applyDecorators(
    ApiOperation({ summary: "Update the quantity of a pizza in the cart" }),
    ApiParam({ name: "pizzaId", type: "string", format: "uuid" }),
    ApiBody({ description: "New quantity", type: UpdateCartItemDto }),
    ApiResponse({ status: 200, description: "Quantity updated" }),
    ApiResponse({ status: 204, description: "Item removed (quantity set to 0)" }),
    ApiResponse({ status: 404, description: "Pizza not found in cart" })
  );

export const ApiRemoveItemCart = () =>
  applyDecorators(
    ApiOperation({ summary: "Remove a pizza from the cart" }),
    ApiParam({ name: "pizzaId", type: "string", format: "uuid" }),
    ApiResponse({ status: 204, description: "Item removed" }),
    ApiResponse({ status: 404, description: "Pizza not found in cart" })
  );

export const ApiClearCart = () =>
  applyDecorators(
    ApiOperation({ summary: "Clear all items from the cart" }),
    ApiResponse({ status: 204, description: "Cart cleared" })
  );
