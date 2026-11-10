import { RmqContext } from "@nestjs/microservices";
import type { OrderCreatedEvent, OrderStatusChangedEvent, UserDeletedEvent, UserRegisteredEvent } from "../../libs/contracts/index.ts";
import { AnalyticsService } from "./analytics.service.ts";
import { AnalyticsReadModelRepository } from "./analytics.repository.ts";
import type { MostOrderedPizzaResult, UserAboveAverageCheckResult } from "./analytics.types.ts";
export declare class AnalyticsMessagesController {
    private readonly analytics;
    private readonly readModel;
    private readonly logger;
    constructor(analytics: AnalyticsService, readModel: AnalyticsReadModelRepository);
    popularPizza(payload: {
        month: number;
        year: number;
    }): Promise<MostOrderedPizzaResult | null>;
    highestChecks(): Promise<UserAboveAverageCheckResult[]>;
    onOrderCreated(event: OrderCreatedEvent, context: RmqContext): Promise<void>;
    onOrderStatusChanged(event: OrderStatusChangedEvent, context: RmqContext): Promise<void>;
    onUserRegistered(event: UserRegisteredEvent, context: RmqContext): Promise<void>;
    onUserDeleted(event: UserDeletedEvent, context: RmqContext): Promise<void>;
}
