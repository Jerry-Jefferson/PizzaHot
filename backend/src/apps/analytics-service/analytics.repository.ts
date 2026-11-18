import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderFact } from "./entities/order-fact.entity.ts";
import { OrderItemFact } from "./entities/order-item-fact.entity.ts";
import { UserFact } from "./entities/user-fact.entity.ts";
import type {
  IAnalyticsRepository,
  MostOrderedPizzaResult,
  MostOrderedPizzaRow,
  OrderFactInput,
  OrderItemFactInput,
  UserAboveAverageCheckResult,
  UserAboveAverageCheckRow,
} from "./analytics.types.ts";

const CANCELLED_STATUS = "cancelled";
const INITIAL_STATUS = "pending";

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
    const rows = await this.orderItemFacts.query<MostOrderedPizzaRow[]>(
      `
      SELECT
        (ARRAY_AGG(i."pizzaName" ORDER BY i."orderedAt" DESC))[1] AS "pizzaName",
        COUNT(DISTINCT i."orderId")::int                          AS "orderCount",
        SUM(i."quantity")::int                                    AS "totalQuantity"
      FROM order_item_facts i
      JOIN order_facts o ON o."orderId" = i."orderId"
      WHERE EXTRACT(MONTH FROM i."orderedAt") = $1
        AND EXTRACT(YEAR FROM i."orderedAt") = $2
        AND o."status" <> $3
      GROUP BY COALESCE(i."pizzaId"::text, i."pizzaName")
      ORDER BY "totalQuantity" DESC, "orderCount" DESC
      LIMIT 1
      `,
      [month, year, CANCELLED_STATUS]
    );

    if (rows.length === 0) {
      return null;
    }

    return {
      pizzaName: rows[0].pizzaName,
      orderCount: Number(rows[0].orderCount),
      totalQuantity: Number(rows[0].totalQuantity),
    };
  }

  async getUsersWithAboveAverageCheck(): Promise<UserAboveAverageCheckResult[]> {
    const rows = await this.orderFacts.query<UserAboveAverageCheckRow[]>(
      `
      WITH counted_orders AS (
        SELECT o.*
        FROM order_facts o
        WHERE o."createdAt" IS NOT NULL
          AND o."status" <> $1
      ),
      global_avg AS (
        SELECT COALESCE(AVG("finalPrice"), 0) AS avg_check
        FROM counted_orders
      )
      SELECT
        f."userId"                                        AS "userId",
        COALESCE(u.email, '')                             AS "email",
        u.name                                            AS "name",
        COUNT(f."orderId")::int                           AS "orderCount",
        AVG(f."finalPrice")::numeric(10,2)                AS "averageCheck",
        (SELECT avg_check FROM global_avg)::numeric(10,2) AS "globalAverageCheck"
      FROM counted_orders f
      LEFT JOIN user_facts u ON u."userId" = f."userId"
      WHERE f."userId" IS NOT NULL
        AND COALESCE(u."isDeleted", false) = false
      GROUP BY f."userId", u.email, u.name
      HAVING COUNT(f."orderId") > 3
        AND AVG(f."finalPrice") >= (SELECT avg_check FROM global_avg)
      ORDER BY "averageCheck" DESC
      `,
      [CANCELLED_STATUS]
    );

    return rows.map((row) => ({
      userId: row.userId,
      email: row.email,
      name: row.name,
      orderCount: Number(row.orderCount),
      averageCheck: Number(row.averageCheck),
      globalAverageCheck: Number(row.globalAverageCheck),
    }));
  }

  async recordOrderFact(fact: OrderFactInput): Promise<void> {
    await this.orderFacts
      .createQueryBuilder()
      .insert()
      .into(OrderFact)
      .values({ ...fact, status: INITIAL_STATUS })
      .orUpdate(["userId", "userEmail", "userName", "finalPrice", "createdAt"], ["orderId"])
      .execute();
  }

  async replaceOrderItemFacts(orderId: string, facts: OrderItemFactInput[]): Promise<void> {
    await this.orderItemFacts.manager.transaction(async (manager) => {
      await manager.delete(OrderItemFact, { orderId });
      if (facts.length > 0) {
        await manager.insert(OrderItemFact, facts);
      }
    });
  }

  async upsertUserFact(fact: Partial<UserFact> & { userId: string }): Promise<void> {
    await this.userFacts.upsert(fact, ["userId"]);
  }

  async markUserDeleted(userId: string): Promise<void> {
    await this.userFacts.update({ userId }, { isDeleted: true });
  }

  async setOrderStatus(orderId: string, status: string): Promise<void> {
    await this.orderFacts.upsert({ orderId, status }, ["orderId"]);
  }
}
