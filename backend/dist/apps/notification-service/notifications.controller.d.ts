import { RmqContext } from "@nestjs/microservices";
import type { CriticalErrorEvent, OrderStatusChangedEvent, UserDeletedEvent, UserRegisteredEvent } from "../../libs/contracts/index.ts";
import { NotificationsService } from "./notifications.service.ts";
export declare class NotificationsMessagesController {
    private readonly notifications;
    private readonly logger;
    constructor(notifications: NotificationsService);
    onUserRegistered(event: UserRegisteredEvent, context: RmqContext): Promise<void>;
    onUserDeleted(event: UserDeletedEvent, context: RmqContext): Promise<void>;
    onOrderStatusChanged(event: OrderStatusChangedEvent, context: RmqContext): Promise<void>;
    onCriticalError(event: CriticalErrorEvent, context: RmqContext): Promise<void>;
}
