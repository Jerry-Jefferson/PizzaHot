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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  ApiAddItemCart,
  ApiApplyPromocodeCart,
  ApiClearCart,
  ApiGetCart,
  ApiRemoveItemCart,
  ApiRemovePromocodeCart,
  ApiUpdateItemQuantityCart,
} from "./carts.api-docs.ts";
import { ApiAuth } from "../../../libs/swagger/api-responses.decorator.ts";
import { CartClient } from "../clients/cart.client.ts";
import { CurrentUser } from "../../../libs/auth/decorators/current-user.decorator.ts";
import type { JwtPayload } from "../../../libs/auth/jwt-payload.schema.ts";
import { ZodValidationPipe } from "../../../libs/validation/zod-validation.pipe.ts";
import {
  addCartItemSchema,
  updateCartItemSchema,
} from "../../cart-service/cart-items/cart-item.schema.ts";
import { applyPromocodeSchema } from "../../cart-service/apply-promocode.schema.ts";
import { AddCartItemDto } from "../../cart-service/cart-items/dto/add-cart-item.dto.ts";
import { UpdateCartItemDto } from "../../cart-service/cart-items/dto/update-cart-item.dto.ts";
import { ApplyPromocodeDto } from "../../cart-service/dto/apply-promocode.dto.ts";
import { CartResponseDto } from "../../cart-service/dto/cart-response.dto.ts";
import type { Response } from "express";

@ApiTags("Carts")
@ApiBearerAuth()
@ApiAuth()
@Controller("carts")
export class CartController {
  constructor(private readonly cartService: CartClient) {}

  @Get()
  @ApiGetCart()
  async getCart(@CurrentUser() user: JwtPayload): Promise<CartResponseDto> {
    return this.cartService.getCart(user.sub);
  }

  @Post("promocode")
  @HttpCode(HttpStatus.OK)
  @ApiApplyPromocodeCart()
  async applyPromocode(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(applyPromocodeSchema)) dto: ApplyPromocodeDto
  ): Promise<CartResponseDto> {
    return this.cartService.applyPromocode(user.sub, dto.code);
  }

  @Delete("promocode")
  @HttpCode(HttpStatus.OK)
  @ApiRemovePromocodeCart()
  async removePromocode(@CurrentUser() user: JwtPayload): Promise<CartResponseDto> {
    return this.cartService.removePromocode(user.sub);
  }

  @Post("items")
  @ApiAddItemCart()
  async addItem(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(addCartItemSchema)) dto: AddCartItemDto
  ) {
    return this.cartService.addItem(user.sub, dto.pizzaId, dto.quantity ?? 1);
  }

  @Patch("items/:pizzaId")
  @ApiUpdateItemQuantityCart()
  async updateItemQuantity(
    @CurrentUser() user: JwtPayload,
    @Param("pizzaId", ParseUUIDPipe) pizzaId: string,
    @Body(new ZodValidationPipe(updateCartItemSchema)) dto: UpdateCartItemDto,
    @Res({ passthrough: true }) res: Pick<Response, "status">
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
  @ApiRemoveItemCart()
  async removeItem(
    @CurrentUser() user: JwtPayload,
    @Param("pizzaId", ParseUUIDPipe) pizzaId: string
  ): Promise<void> {
    await this.cartService.removeItem(user.sub, pizzaId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiClearCart()
  async clearCart(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.cartService.clearCart(user.sub);
  }
}
