import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { EVENTS, NotificationType } from "../../libs/contracts/index.ts";
import type {
  CriticalErrorEvent,
  OrderStatusChangedEvent,
  UserDeletedEvent,
  UserRegisteredEvent,
} from "../../libs/contracts/index.ts";
import { NotificationsService } from "./notifications.service.ts";
import { ack } from "../../libs/messaging/ack.ts";

@Controller()
export class NotificationsMessagesController {
  private readonly logger = new Logger(NotificationsMessagesController.name);

  constructor(private readonly notifications: NotificationsService) {}

  @EventPattern(EVENTS.userRegistered)
  async onUserRegistered(
    @Payload() event: UserRegisteredEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.userRegistered, async () => {
      await this.notifications.send({
        type: NotificationType.ACCOUNT_REGISTERED,
        recipient: event.email,
        data: { name: event.name },
      });

      await this.notifications.send({
        type: NotificationType.EMAIL_VERIFICATION,
        recipient: event.email,
        data: { name: event.name, verificationToken: event.verificationToken },
      });
    });
  }

  @EventPattern(EVENTS.userDeleted)
  async onUserDeleted(
    @Payload() event: UserDeletedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.userDeleted, () =>
      this.notifications.send({
        type: NotificationType.ACCOUNT_DELETED,
        recipient: event.email,
        data: { name: event.name },
      })
    );
  }

  @EventPattern(EVENTS.orderStatusChanged)
  async onOrderStatusChanged(
    @Payload() event: OrderStatusChangedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.orderStatusChanged, () => {
      this.logger.log(`Order ${event.orderId} moved to ${event.status}`);
      return Promise.resolve();
    });
  }

  @EventPattern(EVENTS.criticalError)
  async onCriticalError(
    @Payload() event: CriticalErrorEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.criticalError, () =>
      this.notifications.send({
        type: NotificationType.CRITICAL_ERROR,
        recipient: process.env.CRITICAL_ERROR_EMAIL ?? "admin@pizzahot.local",
        data: { ...event },
      })
    );
  }
}
