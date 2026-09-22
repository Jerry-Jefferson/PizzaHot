import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { ORDERS_REPOSITORY, ORDER_ITEMS_REPOSITORY } from "../../libs/database/tokens.ts";
import type { IOrderItemsRepository, IOrdersRepository, ListOrdersQuery } from "./order.types.ts";
import {
  CART_CLIENT,
  CATALOG_CLIENT,
  PROMOCODE_CLIENT,
  EVENTS_CLIENT,
} from "../../libs/messaging/tokens.constant.ts";
import { EVENTS, RPC } from "../../libs/contracts/index.ts";
import type {
  OrderCreatedEvent,
  OrderFailedEvent,
  CheckoutSnapshot,
  ResolvedPizza,
  ReservedPromocode,
} from "../../libs/contracts/index.ts";
import { rpc } from "../../libs/messaging/rpc.util.ts";
import { OrderResponseDto } from "./dto/order-response.dto.ts";
import { CreateOrderDto } from "./dto/create-order.dto.ts";
import { OrderStatus } from "./constants/order-status.constant.ts";
import { PaginatedResponseDto } from "../../libs/pagination/paginated-response.dto.ts";
import { calculatePrice } from "../../libs/price-calculation/price-calculation.ts";
import { MAX_PIZZA_QUANTITY } from "../../libs/contracts/order-limit.constant.ts";
import { Order } from "./order.entity.ts";
import type { PaginatedResult } from "../../libs/pagination/pagination.types.ts";

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject(ORDERS_REPOSITORY)
    private readonly ordersRepository: IOrdersRepository,
    @Inject(ORDER_ITEMS_REPOSITORY)
    private readonly orderItemsRepository: IOrderItemsRepository,
    @Inject(CART_CLIENT)
    private readonly cartClient: ClientProxy,
    @Inject(CATALOG_CLIENT)
    private readonly catalogClient: ClientProxy,
    @Inject(PROMOCODE_CLIENT)
    private readonly promocodeClient: ClientProxy,
    @Inject(EVENTS_CLIENT)
    private readonly events: ClientProxy
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    const snapshot = await rpc<CheckoutSnapshot>(this.cartClient, RPC.cart.checkoutSnapshot, {
      userId,
    });

    if (!snapshot.cartId) {
      throw new NotFoundException("No cart");
    }

    if (snapshot.items.length === 0) {
      throw new BadRequestException("Cart is empty");
    }

    for (const item of snapshot.items) {
      if (item.quantity > MAX_PIZZA_QUANTITY) {
        throw new BadRequestException(`Quantity cannot exceed ${MAX_PIZZA_QUANTITY}`);
      }
    }

    const resolved = await rpc<ResolvedPizza[]>(this.catalogClient, RPC.catalog.pizzaResolve, {
      pizzaIds: snapshot.items.map((item) => item.pizzaId),
    });

    const priceById = new Map(resolved.map((pizza) => [pizza.pizzaId, pizza]));

    const orderItemsToCreate = snapshot.items.map((item) => {
      const pizza = priceById.get(item.pizzaId);

      if (!pizza || !pizza.isAvailable) {
        throw new BadRequestException(`Pizza "${item.pizzaId}" is no longer available`);
      }

      return {
        pizzaId: pizza.pizzaId,
        pizzaName: pizza.name,
        priceAtPurchase: Number(pizza.price),
        quantity: item.quantity,
      };
    });

    let reserved: ReservedPromocode | null = null;

    if (snapshot.promocodeId) {
      reserved = await rpc<ReservedPromocode>(this.promocodeClient, RPC.promocode.reserve, {
        userId,
        promocodeId: snapshot.promocodeId,
      });
    }

    const { totalPrice, discountAmount, finalPrice } = calculatePrice(
      orderItemsToCreate.map((item) => ({
        price: item.priceAtPurchase,
        quantity: item.quantity,
      })),
      reserved
        ? {
            discount: Number(reserved.promocode.discount),
            discountMode: reserved.promocode.discountMode,
            validTill: new Date(reserved.promocode.validTill),
          }
        : null
    );

    let savedOrder: Order;

    try {
      const order = this.ordersRepository.create({
        userId,
        promocodeId: reserved?.promocode.id ?? null,
        codeApplied: reserved?.promocode.code ?? null,
        address: dto.address ?? "",
        delivery: dto.delivery,
        paymentMethod: dto.paymentMethod,
        totalPrice,
        discountAmount,
        finalPrice,
        status: OrderStatus.PENDING,
        comment: dto.comment ?? null,
      });

      savedOrder = await this.ordersRepository.save(order);

      const itemsToSave = orderItemsToCreate.map((item) =>
        this.orderItemsRepository.create({ ...item, order: { id: savedOrder.id } })
      );

      await this.orderItemsRepository.saveMany(itemsToSave);
    } catch (error) {
      const failure: OrderFailedEvent = {
        orderId: "",
        userId,
        promocodeId: snapshot.promocodeId,
        reason: String(error),
      };
      this.events.emit(EVENTS.orderFailed, failure);

      this.logger.error(
        `Checkout failed for user ${userId}: ${String(error)}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }

    const created: OrderCreatedEvent = {
      orderId: savedOrder.id,
      userId,
      userEmail: null,
      promocodeId: reserved?.promocode.id ?? null,
      totalPrice,
      discountAmount,
      finalPrice,
      items: orderItemsToCreate.map((item) => ({
        pizzaId: item.pizzaId,
        pizzaName: item.pizzaName,
        priceAtPurchase: item.priceAtPurchase,
        quantity: item.quantity,
      })),
      createdAt: new Date().toISOString(),
    };

    this.events.emit(EVENTS.orderCreated, created);

    const fullOrder = await this.ordersRepository.findById(savedOrder.id);

    if (!fullOrder) {
      throw new NotFoundException("Created order was not found");
    }

    this.logger.log(
      `Order placed: #${savedOrder.id} by user ${userId} with total ${finalPrice} (${orderItemsToCreate.length} items)`
    );

    return OrderResponseDto.fromEntity(fullOrder);
  }

  async findByUserId(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    const { data, total } = await this.ordersRepository.findPaginated({
      page,
      limit,
      userId,
    });

    return new PaginatedResponseDto(
      data.map((order) => OrderResponseDto.fromEntity(order)),
      page,
      limit,
      total
    );
  }

  async findMyOrderById(orderId: string, userId: string): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findById(orderId);

    if (!order || order.userId !== userId) {
      throw new NotFoundException(`Order with id "${orderId}" not found`);
    }

    return OrderResponseDto.fromEntity(order);
  }

  async findById(orderId: string): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order with id "${orderId}" not found`);
    }

    return OrderResponseDto.fromEntity(order);
  }

  async findAll(query: ListOrdersQuery): Promise<PaginatedResult<OrderResponseDto>> {
    const { data, total } = await this.ordersRepository.findPaginated(query);

    return { data: OrderResponseDto.fromEntities(data), total };
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order with id "${orderId}" not found`);
    }

    await this.ordersRepository.updateStatus(orderId, status);

    const updatedOrder = await this.ordersRepository.findById(orderId);

    if (!updatedOrder) {
      throw new NotFoundException("Updated order was not found");
    }

    this.logger.log(`Order #${orderId} status changed from "${order.status}" to "${status}"`);

    return OrderResponseDto.fromEntity(updatedOrder);
  }
}
