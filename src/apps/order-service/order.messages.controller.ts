import { Controller, Inject, Logger } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { EVENTS, RPC } from "../../libs/contracts/patterns.ts";
import type { OrderStatusChangedEvent, UserDeletedEvent } from "../../libs/contracts/events.ts";
import { EVENTS_CLIENT } from "../../libs/messaging/tokens.ts";
import { ack } from "../../libs/messaging/ack.ts";
import { OrdersService } from "./orders/orders.service.ts";
import { ORDERS_REPOSITORY } from "../../libs/common/database/tokens.ts";
import type { IOrdersRepository } from "./orders/interfaces/orders.repository.interface.ts";
import type { CreateOrderDto } from "./orders/dto/create-order.dto.ts";
import type { OrderStatus } from "./orders/constants/order-status.constant.ts";
import type { DeliveryType } from "./orders/constants/delivery-type.constant.ts";
import type { PaymentMethod } from "./orders/constants/payment-method.constant.ts";

@Controller()
export class OrderMessagesController {
  private readonly logger = new Logger(OrderMessagesController.name);

  constructor(
    private readonly orders: OrdersService,
    @Inject(ORDERS_REPOSITORY)
    private readonly ordersRepository: IOrdersRepository,
    @Inject(EVENTS_CLIENT)
    private readonly events: ClientProxy
  ) {}

  @MessagePattern(RPC.order.create)
  create(@Payload() payload: { userId: string; dto: CreateOrderDto }): Promise<unknown> {
    return this.orders.create(payload.userId, payload.dto);
  }

  @MessagePattern(RPC.order.findMine)
  findMine(
    @Payload() payload: { userId: string; page?: number; limit?: number }
  ): Promise<unknown> {
    return this.orders.findByUserId(payload.userId, payload.page ?? 1, payload.limit ?? 10);
  }

  @MessagePattern(RPC.order.findMineById)
  findMineById(@Payload() payload: { userId: string; orderId: string }): Promise<unknown> {
    return this.orders.findMyOrderById(payload.orderId, payload.userId);
  }

  @MessagePattern(RPC.order.findById)
  findById(@Payload() payload: { orderId: string }): Promise<unknown> {
    return this.orders.findById(payload.orderId);
  }

  @MessagePattern(RPC.order.findAll)
  findAll(
    @Payload()
    payload: {
      page?: number;
      limit?: number;
      userId?: string;
      status?: OrderStatus;
      delivery?: DeliveryType;
      paymentMethod?: PaymentMethod;
    }
  ): Promise<unknown> {
    return this.orders.findAll(
      payload.page ?? 1,
      payload.limit ?? 10,
      payload.userId,
      payload.status,
      payload.delivery,
      payload.paymentMethod
    );
  }

  @MessagePattern(RPC.order.findByUserId)
  findByUserId(
    @Payload() payload: { userId: string; page?: number; limit?: number }
  ): Promise<unknown> {
    return this.orders.findByUserId(payload.userId, payload.page ?? 1, payload.limit ?? 10);
  }

  @MessagePattern(RPC.order.updateStatus)
  async updateStatus(
    @Payload() payload: { orderId: string; status: OrderStatus }
  ): Promise<unknown> {
    const before = await this.orders.findById(payload.orderId);
    const updated = await this.orders.updateStatus(payload.orderId, payload.status);

    const event: OrderStatusChangedEvent = {
      orderId: payload.orderId,
      userId: before.userId ?? "",
      previousStatus: before.status,
      status: payload.status,
    };
    this.events.emit(EVENTS.orderStatusChanged, event);

    return updated;
  }

  @EventPattern(EVENTS.userDeleted)
  async onUserDeleted(
    @Payload() event: UserDeletedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.userDeleted, async () => {
      const detached = await this.ordersRepository.detachUser(event.userId);
      this.logger.log(`Detached ${detached} order(s) from deleted user ${event.userId}`);
    });
  }
}
