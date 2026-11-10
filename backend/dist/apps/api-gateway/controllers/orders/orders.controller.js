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
import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe, HttpCode, HttpStatus, UseGuards, } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiCreateOrder, ApiSearchOrders, ApiGetMyOrderByIdOrder, ApiGetMyOrders, ApiGetOrderByIdOrder, ApiGetOrdersByUserOrder, ApiUpdateStatusOrder, } from "./orders.api-docs.js";
import { OrderClient } from "../../clients/order.client.js";
import { CurrentUser } from "../../../../libs/auth/decorators/current-user.decorator.js";
import { EmailVerifiedGuard } from "../../../../libs/auth/guards/email-verified.guard.js";
import { ZodValidationPipe } from "../../../../libs/validation/zod-validation.pipe.js";
import { createOrderSchema, updateOrderStatusSchema, listOrdersQuerySchema, } from "../../../order-service/order.schema.js";
import { paginationSchema, } from "../../../../libs/pagination/pagination.schema.js";
import { CreateOrderDto } from "../../../order-service/dto/create-order.dto.js";
import { UpdateOrderStatusDto } from "../../../order-service/dto/update-order-status.dto.js";
import { Can } from "../../../../libs/auth/decorators/can.decorator.js";
import { Permission } from "../../../../libs/auth/permission.constant.js";
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async create(user, dto) {
        return this.ordersService.create(user.sub, dto);
    }
    async getMyOrders(user, query) {
        return this.ordersService.findByUserId(user.sub, query.page, query.limit);
    }
    async getMyOrderById(user, id) {
        return this.ordersService.findMyOrderById(id, user.sub);
    }
    async searchOrders(query) {
        return this.ordersService.findAll(query);
    }
    async getOrdersByUser(userId, query) {
        return this.ordersService.findByUserId(userId, query.page, query.limit);
    }
    async getOrderById(id) {
        return this.ordersService.findById(id);
    }
    async updateStatus(id, dto) {
        return this.ordersService.updateStatus(id, dto.status);
    }
};
__decorate([
    Post(),
    Can(Permission.ORDER_CREATE),
    UseGuards(EmailVerifiedGuard),
    HttpCode(HttpStatus.CREATED),
    ApiCreateOrder(),
    __param(0, CurrentUser()),
    __param(1, Body(new ZodValidationPipe(createOrderSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    Get("my"),
    Can(Permission.ORDER_READ_OWN),
    ApiGetMyOrders(),
    __param(0, CurrentUser()),
    __param(1, Query(new ZodValidationPipe(paginationSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getMyOrders", null);
__decorate([
    Get("my/:id"),
    Can(Permission.ORDER_READ_OWN),
    ApiGetMyOrderByIdOrder(),
    __param(0, CurrentUser()),
    __param(1, Param("id", ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getMyOrderById", null);
__decorate([
    Post("search"),
    HttpCode(HttpStatus.OK),
    Can(Permission.ORDER_READ_ANY),
    ApiSearchOrders(),
    __param(0, Body(new ZodValidationPipe(listOrdersQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "searchOrders", null);
__decorate([
    Get("user/:userId"),
    Can(Permission.ORDER_READ_ANY),
    ApiGetOrdersByUserOrder(),
    __param(0, Param("userId", ParseUUIDPipe)),
    __param(1, Query(new ZodValidationPipe(paginationSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrdersByUser", null);
__decorate([
    Get(":id"),
    Can(Permission.ORDER_READ_ANY),
    ApiGetOrderByIdOrder(),
    __param(0, Param("id", ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderById", null);
__decorate([
    Patch(":id/status"),
    Can(Permission.ORDER_STATUS_WRITE),
    ApiUpdateStatusOrder(),
    __param(0, Param("id", ParseUUIDPipe)),
    __param(1, Body(new ZodValidationPipe(updateOrderStatusSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
OrdersController = __decorate([
    ApiTags("Orders"),
    ApiBearerAuth(),
    Controller("orders"),
    __metadata("design:paramtypes", [OrderClient])
], OrdersController);
export { OrdersController };
//# sourceMappingURL=orders.controller.js.map