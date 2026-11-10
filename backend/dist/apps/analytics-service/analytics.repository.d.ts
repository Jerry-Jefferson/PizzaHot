import { Repository } from "typeorm";
import { OrderFact } from "./entities/order-fact.entity.ts";
import { OrderItemFact } from "./entities/order-item-fact.entity.ts";
import { UserFact } from "./entities/user-fact.entity.ts";
import type { IAnalyticsRepository, MostOrderedPizzaResult, UserAboveAverageCheckResult } from "./analytics.types.ts";
export declare class AnalyticsReadModelRepository implements IAnalyticsRepository {
    private readonly orderFacts;
    private readonly orderItemFacts;
    private readonly userFacts;
    constructor(orderFacts: Repository<OrderFact>, orderItemFacts: Repository<OrderItemFact>, userFacts: Repository<UserFact>);
    getMostOrderedPizzaInMonth(month: number, year: number): Promise<MostOrderedPizzaResult | null>;
    getUsersWithAboveAverageCheck(): Promise<UserAboveAverageCheckResult[]>;
    upsertOrderFact(fact: Partial<OrderFact> & {
        orderId: string;
    }): Promise<void>;
    upsertOrderItemFacts(facts: Partial<OrderItemFact>[]): Promise<void>;
    upsertUserFact(fact: Partial<UserFact> & {
        userId: string;
    }): Promise<void>;
    markUserDeleted(userId: string): Promise<void>;
    setOrderStatus(orderId: string, status: string): Promise<void>;
}
