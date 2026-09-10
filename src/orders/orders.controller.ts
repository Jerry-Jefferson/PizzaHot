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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { OrdersService } from "./orders.service.ts";
import { CurrentUser } from "../auth/decorators/current-user.decorator.ts";
import type { JwtPayload } from "../auth/types/jwt-payload.interface.ts";
import { Roles } from "../auth/decorators/roles.decorator.ts";
import { Role } from "../shared/constants/role.enum.ts";
import { EmailVerifiedGuard } from "../auth/guards/email-verified.guard.ts";
import { ZodValidationPipe } from "../shared/pipes/zod-validation.pipe.ts";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  listOrdersQuerySchema,
} from "./schemas/order.schema.ts";
import { paginationSchema } from "../shared/pagination/pagination.schema.ts";
import { CreateOrderDto } from "./dto/create-order.dto.ts";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto.ts";
import { OrderResponseDto } from "./dto/order-response.dto.ts";
import { PaginatedResponseDto } from "../shared/pagination/dto/paginated-response.dto.ts";
import { OrderStatus } from "./constants/order-status.constant.ts";
import { DeliveryType } from "./constants/delivery-type.constant.ts";
import { PaymentMethod } from "./constants/payment-method.constant.ts";

@ApiTags("Orders")
@ApiBearerAuth()
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(EmailVerifiedGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new order (Checkout cart)" })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: "Order created successfully", type: OrderResponseDto })
  @ApiResponse({
    status: 400,
    description: "Bad request (e.g. cart empty, invalid delivery address)",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Promocode or Pizza not found" })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createOrderSchema)) dto: CreateOrderDto
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(user.sub, dto);
  }

  @Get("my")
  @ApiOperation({ summary: "Get all orders for the current user" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: "Paginated user orders", type: PaginatedResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getMyOrders(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(paginationSchema))
    query: { page: number; limit: number }
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    return this.ordersService.findByUserId(user.sub, query.page, query.limit);
  }

  @Get("my/:id")
  @ApiOperation({ summary: "Get a specific order of the current user" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiResponse({ status: 200, description: "Order details", type: OrderResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async getMyOrderById(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<OrderResponseDto> {
    return this.ordersService.findMyOrderById(id, user.sub);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Get all orders (Admin only)" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "userId", required: false, type: String })
  @ApiQuery({ name: "status", required: false, enum: OrderStatus })
  @ApiQuery({ name: "delivery", required: false, enum: DeliveryType })
  @ApiQuery({ name: "paymentMethod", required: false, enum: PaymentMethod })
  @ApiResponse({ status: 200, description: "Paginated orders list", type: PaginatedResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions" })
  async getAllOrders(
    @Query(new ZodValidationPipe(listOrdersQuerySchema))
    query: {
      page: number;
      limit: number;
      userId?: string;
      status?: OrderStatus;
      delivery?: DeliveryType;
      paymentMethod?: PaymentMethod;
    }
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    const { data, total } = await this.ordersService.findAll(
      query.page,
      query.limit,
      query.userId,
      query.status,
      query.delivery,
      query.paymentMethod
    );
    return new PaginatedResponseDto(
      data.map((order) => OrderResponseDto.fromEntity(order)),
      query.page,
      query.limit,
      total
    );
  }

  @Get("user/:userId")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Get all orders by a particular user (Admin only)" })
  @ApiParam({ name: "userId", type: "string", format: "uuid" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: "Paginated user orders", type: PaginatedResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions" })
  async getOrdersByUser(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Query(new ZodValidationPipe(paginationSchema))
    query: { page: number; limit: number }
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    return this.ordersService.findByUserId(userId, query.page, query.limit);
  }

  @Get(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Get 1 order by its ID (Admin only)" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiResponse({ status: 200, description: "Order details", type: OrderResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async getOrderById(@Param("id", ParseUUIDPipe) id: string): Promise<OrderResponseDto> {
    return this.ordersService.findById(id);
  }

  @Patch(":id/status")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Update only status of the order (Admin only)" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({
    status: 200,
    description: "Order status updated successfully",
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid status" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateOrderStatusSchema)) dto: UpdateOrderStatusDto
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateStatus(id, dto.status);
  }
}
