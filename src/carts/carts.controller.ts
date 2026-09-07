import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Res,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CartService } from "./carts.service.ts";
import { CurrentUser } from "../auth/decorators/current-user.decorator.ts";
import type { JwtPayload } from "../auth/types/jwt-payload.interface.ts";
import { ZodValidationPipe } from "../shared/pipes/zod-validation.pipe.ts";
import { addCartItemSchema, updateCartItemSchema } from "./schemas/cart-item.schema.ts";
import { AddCartItemDto } from "./dto/add-cart-item.dto.ts";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto.ts";
import type { Response } from "express";

@ApiTags("Cart")
@ApiBearerAuth()
@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get the current user's cart" })
  @ApiResponse({ status: 200, description: "Cart with items" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getCart(@CurrentUser() user: JwtPayload) {
    return this.cartService.getCart(user.sub);
  }

  @Post("items")
  @ApiOperation({ summary: "Add a pizza to the cart" })
  @ApiBody({ description: "Pizza to add", type: AddCartItemDto })
  @ApiResponse({ status: 201, description: "Item added to cart" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pizza not found" })
  async addItem(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(addCartItemSchema)) dto: AddCartItemDto
  ) {
    return this.cartService.addItem(user.sub, dto.pizzaId, dto.quantity ?? 1);
  }

  @Patch("items/:pizzaId")
  @ApiOperation({ summary: "Update the quantity of a pizza in the cart" })
  @ApiParam({ name: "pizzaId", type: "string", format: "uuid" })
  @ApiBody({ description: "New quantity", type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: "Quantity updated" })
  @ApiResponse({ status: 204, description: "Item removed (quantity set to 0)" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pizza not found in cart" })
  async updateItemQuantity(
    @CurrentUser() user: JwtPayload,
    @Param("pizzaId", ParseUUIDPipe) pizzaId: string,
    @Body(new ZodValidationPipe(updateCartItemSchema)) dto: UpdateCartItemDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.cartService.updateItemQuantity(user.sub, pizzaId, dto.quantity);
    if (!result) {
      res.status(HttpStatus.NO_CONTENT);
      return;
    }
    return result;
  }

  @Delete("items/:pizzaId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove a pizza from the cart" })
  @ApiParam({ name: "pizzaId", type: "string", format: "uuid" })
  @ApiResponse({ status: 204, description: "Item removed" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pizza not found in cart" })
  async removeItem(
    @CurrentUser() user: JwtPayload,
    @Param("pizzaId", ParseUUIDPipe) pizzaId: string
  ): Promise<void> {
    return this.cartService.removeItem(user.sub, pizzaId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Clear all items from the cart" })
  @ApiResponse({ status: 204, description: "Cart cleared" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async clearCart(@CurrentUser() user: JwtPayload): Promise<void> {
    return this.cartService.clearCart(user.sub);
  }
}
