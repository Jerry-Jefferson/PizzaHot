import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { EVENTS, RPC } from "../../libs/contracts/index.ts";
import type {
  OrderCreatedEvent,
  OrderStatusChangedEvent,
  UserDeletedEvent,
  UserRegisteredEvent,
} from "../../libs/contracts/index.ts";
import { ack } from "../../libs/messaging/ack.ts";
import { AnalyticsService } from "./analytics.service.ts";
import { AnalyticsReadModelRepository } from "./analytics.repository.ts";
import type { MostOrderedPizzaResult, UserAboveAverageCheckResult } from "./analytics.types.ts";

@Controller()
export class AnalyticsMessagesController {
  private readonly logger = new Logger(AnalyticsMessagesController.name);

  constructor(
    private readonly analytics: AnalyticsService,
    private readonly readModel: AnalyticsReadModelRepository
  ) {}

  @MessagePattern(RPC.analytics.popularPizza)
  popularPizza(
    @Payload() payload: { month: number; year: number }
  ): Promise<MostOrderedPizzaResult | null> {
    return this.analytics.getMostOrderedPizzaInMonth(payload.month, payload.year);
  }

  @MessagePattern(RPC.analytics.highestChecks)
  highestChecks(): Promise<UserAboveAverageCheckResult[]> {
    return this.analytics.getUsersWithAboveAverageCheck();
  }

  @EventPattern(EVENTS.orderCreated)
  async onOrderCreated(
    @Payload() event: OrderCreatedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.orderCreated, async () => {
      const createdAt = new Date(event.createdAt);

      await this.readModel.upsertOrderFact({
        orderId: event.orderId,
        userId: event.userId,
        userEmail: event.userEmail,
        userName: null,
        finalPrice: event.finalPrice,
        createdAt,
        status: "pending",
      });

      await this.readModel.upsertOrderItemFacts(
        event.items.map((item) => ({
          orderId: event.orderId,
          pizzaId: item.pizzaId,
          pizzaName: item.pizzaName,
          quantity: item.quantity,
          orderedAt: createdAt,
        }))
      );
    });
  }

  @EventPattern(EVENTS.orderStatusChanged)
  async onOrderStatusChanged(
    @Payload() event: OrderStatusChangedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.orderStatusChanged, () =>
      this.readModel.setOrderStatus(event.orderId, event.status)
    );
  }

  @EventPattern(EVENTS.userRegistered)
  async onUserRegistered(
    @Payload() event: UserRegisteredEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.userRegistered, () =>
      this.readModel.upsertUserFact({
        userId: event.userId,
        email: event.email,
        name: event.name,
        isDeleted: false,
      })
    );
  }

  @EventPattern(EVENTS.userDeleted)
  async onUserDeleted(
    @Payload() event: UserDeletedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.userDeleted, () =>
      this.readModel.markUserDeleted(event.userId)
    );
  }
}
