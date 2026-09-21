import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  ApiCreateOrder,
  ApiSearchOrders,
  ApiGetMyOrderByIdOrder,
  ApiGetMyOrders,
  ApiGetOrderByIdOrder,
  ApiGetOrdersByUserOrder,
  ApiUpdateStatusOrder,
} from "./orders.api-docs.ts";
import { OrderClient } from "../clients/order.client.ts";
import { CurrentUser } from "../../../libs/auth/decorators/current-user.decorator.ts";
import type { JwtPayload } from "../../../libs/auth/jwt-payload.schema.ts";
import { Roles } from "../../../libs/auth/decorators/roles.decorator.ts";
import { Role } from "../../../libs/common/constants/role.constant.ts";
import { EmailVerifiedGuard } from "../../../libs/auth/guards/email-verified.guard.ts";
import { ZodValidationPipe } from "../../../libs/common/pipes/zod-validation.pipe.ts";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  listOrdersQuerySchema,
} from "../../order-service/order.schema.ts";
import {
  paginationSchema,
  type PaginationQuery,
} from "../../../libs/common/pagination/pagination.schema.ts";
import { CreateOrderDto } from "../../order-service/dto/create-order.dto.ts";
import { UpdateOrderStatusDto } from "../../order-service/dto/update-order-status.dto.ts";
import { OrderResponseDto } from "../../order-service/dto/order-response.dto.ts";
import { PaginatedResponseDto } from "../../../libs/common/pagination/paginated-response.dto.ts";
import type { ListOrdersQuery } from "../../order-service/order.types.ts";

@ApiTags("Orders")
@ApiBearerAuth()
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrderClient) {}

  @Post()
  @UseGuards(EmailVerifiedGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOrder()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createOrderSchema)) dto: CreateOrderDto
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(user.sub, dto);
  }

  @Get("my")
  @ApiGetMyOrders()
  async getMyOrders(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(paginationSchema))
    query: PaginationQuery
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    return this.ordersService.findByUserId(user.sub, query.page, query.limit);
  }

  @Get("my/:id")
  @ApiGetMyOrderByIdOrder()
  async getMyOrderById(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<OrderResponseDto> {
    return this.ordersService.findMyOrderById(id, user.sub);
  }

  /**
   * A search, not a creation: POST is here only because the filter travels in the body, so
   * the handler has to say 200 out loud - Nest answers 201 to a POST by default.
   */
  @Post("search")
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiSearchOrders()
  async searchOrders(
    @Body(new ZodValidationPipe(listOrdersQuerySchema))
    query: ListOrdersQuery
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    return this.ordersService.findAll(query);
  }

  @Get("user/:userId")
  @Roles(Role.ADMIN)
  @ApiGetOrdersByUserOrder()
  async getOrdersByUser(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Query(new ZodValidationPipe(paginationSchema))
    query: PaginationQuery
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    return this.ordersService.findByUserId(userId, query.page, query.limit);
  }

  @Get(":id")
  @Roles(Role.ADMIN)
  @ApiGetOrderByIdOrder()
  async getOrderById(@Param("id", ParseUUIDPipe) id: string): Promise<OrderResponseDto> {
    return this.ordersService.findById(id);
  }

  @Patch(":id/status")
  @Roles(Role.ADMIN)
  @ApiUpdateStatusOrder()
  async updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateOrderStatusSchema)) dto: UpdateOrderStatusDto
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateStatus(id, dto.status);
  }
}
