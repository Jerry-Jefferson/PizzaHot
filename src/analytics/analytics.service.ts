import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class AnalyticsService {
  constructor(private readonly dataSource: DataSource) {}

  async getMostOrderedPizzaInMonth(
    month: number,
    year: number
  ): Promise<{ pizzaName: string; orderCount: number } | null> {
    const rows = await this.dataSource.query(
      `
      SELECT
        oi."pizzaName"                        AS "pizzaName",
        COUNT(DISTINCT oi.order_id)::int      AS "orderCount"
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id
      WHERE EXTRACT(MONTH FROM o."createdAt") = $1
        AND EXTRACT(YEAR FROM o."createdAt") = $2
      GROUP BY oi."pizzaName"
      ORDER BY "orderCount" DESC
      LIMIT 1
      `,
      [month, year]
    );

    if (rows.length === 0) {
      return null;
    }

    return {
      pizzaName: String(rows[0].pizzaName),
      orderCount: Number(rows[0].orderCount),
    };
  }

  async getUsersWithAboveAverageCheck(): Promise<
    {
      userId: string;
      email: string;
      name: string | null;
      orderCount: number;
      averageCheck: number;
      globalAverageCheck: number;
    }[]
  > {
    const rows = await this.dataSource.query(`
      WITH global_avg AS (
        SELECT COALESCE(AVG("finalPrice"), 0) AS avg_check
        FROM orders
      )
      SELECT
        u.id                                          AS "userId",
        u.email                                       AS "email",
        u.name                                        AS "name",
        COUNT(o.id)::int                              AS "orderCount",
        AVG(o."finalPrice")::numeric(10,2)            AS "averageCheck",
        (SELECT avg_check FROM global_avg)::numeric(10,2) AS "globalAverageCheck"
      FROM users u
      INNER JOIN orders o ON o.user_id = u.id
      GROUP BY u.id, u.email, u.name
      HAVING COUNT(o.id) > 3
        AND AVG(o."finalPrice") >= (SELECT avg_check FROM global_avg)
      ORDER BY "averageCheck" DESC
    `);

    return rows.map((row: Record<string, unknown>) => ({
      userId: String(row.userId),
      email: String(row.email),
      name: row.name !== null ? String(row.name) : null,
      orderCount: Number(row.orderCount),
      averageCheck: Number(row.averageCheck),
      globalAverageCheck: Number(row.globalAverageCheck),
    }));
  }
}
