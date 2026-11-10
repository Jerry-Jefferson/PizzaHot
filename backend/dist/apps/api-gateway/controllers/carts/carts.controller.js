var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Post, Patch, Delete, Body, Param, Res, ParseUUIDPipe, HttpCode, HttpStatus, } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiAddItemCart, ApiApplyPromocodeCart, ApiClearCart, ApiGetCart, ApiRemoveItemCart, ApiRemovePromocodeCart, ApiUpdateItemQuantityCart, } from "./carts.api-docs.js";
import { ApiAuth } from "../../../../libs/swagger/api-responses.decorator.js";
import { CartClient } from "../../clients/cart.client.js";
import { CurrentUser } from "../../../../libs/auth/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../../../../libs/validation/zod-validation.pipe.js";
import { addCartItemSchema, updateCartItemSchema, } from "../../../cart-service/cart-items/cart-item.schema.js";
import { applyPromocodeSchema } from "../../../cart-service/apply-promocode.schema.js";
import { AddCartItemDto } from "../../../cart-service/cart-items/dto/add-cart-item.dto.js";
import { UpdateCartItemDto } from "../../../cart-service/cart-items/dto/update-cart-item.dto.js";
import { ApplyPromocodeDto } from "../../../cart-service/dto/apply-promocode.dto.js";
import { Can } from "../../../../libs/auth/decorators/can.decorator.js";
import { Permission } from "../../../../libs/auth/permission.constant.js";
let CartController = class CartController {
    cartService;
    constructor(cartService) {
        this.cartService = cartService;
    }
    async getCart(user) {
        return this.cartService.getCart(user.sub);
    }
    async applyPromocode(user, dto) {
        return this.cartService.applyPromocode(user.sub, dto.code);
    }
    async removePromocode(user) {
        return this.cartService.removePromocode(user.sub);
    }
    async addItem(user, dto) {
        return this.cartService.addItem(user.sub, dto.pizzaId, dto.quantity ?? 1);
    }
    async updateItemQuantity(user, pizzaId, dto, res) {
        const result = await this.cartService.updateItemQuantity(user.sub, pizzaId, dto.quantity);
        if (!result) {
            res.status(HttpStatus.NO_CONTENT);
            return;
        }
        return result;
    }
    async removeItem(user, pizzaId) {
        await this.cartService.removeItem(user.sub, pizzaId);
    }
    async clearCart(user) {
        await this.cartService.clearCart(user.sub);
    }
};
__decorate([
    Get(),
    Can(Permission.CART_MANAGE),
    ApiGetCart(),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "getCart", null);
__decorate([
    Post("promocode"),
    Can(Permission.CART_MANAGE),
    HttpCode(HttpStatus.OK),
    ApiApplyPromocodeCart(),
    __param(0, CurrentUser()),
    __param(1, Body(new ZodValidationPipe(applyPromocodeSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ApplyPromocodeDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "applyPromocode", null);
__decorate([
    Delete("promocode"),
    Can(Permission.CART_MANAGE),
    HttpCode(HttpStatus.OK),
    ApiRemovePromocodeCart(),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "removePromocode", null);
__decorate([
    Post("items"),
    Can(Permission.CART_MANAGE),
    ApiAddItemCart(),
    __param(0, CurrentUser()),
    __param(1, Body(new ZodValidationPipe(addCartItemSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, AddCartItemDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "addItem", null);
__decorate([
    Patch("items/:pizzaId"),
    Can(Permission.CART_MANAGE),
    ApiUpdateItemQuantityCart(),
    __param(0, CurrentUser()),
    __param(1, Param("pizzaId", ParseUUIDPipe)),
    __param(2, Body(new ZodValidationPipe(updateCartItemSchema))),
    __param(3, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateCartItemDto, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "updateItemQuantity", null);
__decorate([
    Delete("items/:pizzaId"),
    Can(Permission.CART_MANAGE),
    HttpCode(HttpStatus.NO_CONTENT),
    ApiRemoveItemCart(),
    __param(0, CurrentUser()),
    __param(1, Param("pizzaId", ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "removeItem", null);
__decorate([
    Delete(),
    Can(Permission.CART_MANAGE),
    HttpCode(HttpStatus.NO_CONTENT),
    ApiClearCart(),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "clearCart", null);
CartController = __decorate([
    ApiTags("Carts"),
    ApiBearerAuth(),
    ApiAuth(),
    Controller("carts"),
    __metadata("design:paramtypes", [CartClient])
], CartController);
export { CartController };
//# sourceMappingURL=carts.controller.js.map