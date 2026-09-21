import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderFact } from "./entities/order-fact.entity.ts";
import { OrderItemFact } from "./entities/order-item-fact.entity.ts";
import { UserFact } from "./entities/user-fact.entity.ts";
import type {
  IAnalyticsRepository,
  MostOrderedPizzaResult,
  UserAboveAverageCheckResult,
  UserAboveAverageCheckRow,
} from "./analytics.types.ts";

@Injectable()
export class AnalyticsReadModelRepository implements IAnalyticsRepository {
  constructor(
    @InjectRepository(OrderFact)
    private readonly orderFacts: Repository<OrderFact>,
    @InjectRepository(OrderItemFact)
    private readonly orderItemFacts: Repository<OrderItemFact>,
    @InjectRepository(UserFact)
    private readonly userFacts: Repository<UserFact>
  ) {}

  async getMostOrderedPizzaInMonth(
    month: number,
    year: number
  ): Promise<MostOrderedPizzaResult | null> {
    const rows = await this.orderItemFacts.query<MostOrderedPizzaResult[]>(
      `
      SELECT
        f."pizzaName"                   AS "pizzaName",
        COUNT(DISTINCT f."orderId")::int AS "orderCount"
      FROM order_item_facts f
      WHERE EXTRACT(MONTH FROM f."orderedAt") = $1
        AND EXTRACT(YEAR FROM f."orderedAt") = $2
      GROUP BY f."pizzaName"
      ORDER BY "orderCount" DESC
      LIMIT 1
      `,
      [month, year]
    );

    if (rows.length === 0) {
      return null;
    }

    return {
      pizzaName: rows[0].pizzaName,
      orderCount: Number(rows[0].orderCount),
    };
  }

  async getUsersWithAboveAverageCheck(): Promise<UserAboveAverageCheckResult[]> {
    const rows = await this.orderFacts.query<UserAboveAverageCheckRow[]>(`
      WITH global_avg AS (
        SELECT COALESCE(AVG("finalPrice"), 0) AS avg_check
        FROM order_facts
      )
      SELECT
        f."userId"                                        AS "userId",
        COALESCE(u.email, '')                             AS "email",
        u.name                                            AS "name",
        COUNT(f."orderId")::int                           AS "orderCount",
        AVG(f."finalPrice")::numeric(10,2)                AS "averageCheck",
        (SELECT avg_check FROM global_avg)::numeric(10,2) AS "globalAverageCheck"
      FROM order_facts f
      LEFT JOIN user_facts u ON u."userId" = f."userId"
      WHERE f."userId" IS NOT NULL
      GROUP BY f."userId", u.email, u.name
      HAVING COUNT(f."orderId") > 3
        AND AVG(f."finalPrice") >= (SELECT avg_check FROM global_avg)
      ORDER BY "averageCheck" DESC
    `);

    return rows.map((row) => ({
      userId: row.userId,
      email: row.email,
      name: row.name,
      orderCount: Number(row.orderCount),
      averageCheck: Number(row.averageCheck),
      globalAverageCheck: Number(row.globalAverageCheck),
    }));
  }

  async upsertOrderFact(fact: Partial<OrderFact> & { orderId: string }): Promise<void> {
    await this.orderFacts.upsert(fact, ["orderId"]);
  }

  async upsertOrderItemFacts(facts: Partial<OrderItemFact>[]): Promise<void> {
    if (facts.length === 0) {
      return;
    }
    await this.orderItemFacts.upsert(facts, ["orderId", "pizzaName"]);
  }

  async upsertUserFact(fact: Partial<UserFact> & { userId: string }): Promise<void> {
    await this.userFacts.upsert(fact, ["userId"]);
  }

  async markUserDeleted(userId: string): Promise<void> {
    await this.userFacts.update({ userId }, { isDeleted: true });
  }

  async setOrderStatus(orderId: string, status: string): Promise<void> {
    await this.orderFacts.update({ orderId }, { status });
  }
}
