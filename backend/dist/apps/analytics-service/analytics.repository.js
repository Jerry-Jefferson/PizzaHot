var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderFact } from "./entities/order-fact.entity.js";
import { OrderItemFact } from "./entities/order-item-fact.entity.js";
import { UserFact } from "./entities/user-fact.entity.js";
let AnalyticsReadModelRepository = class AnalyticsReadModelRepository {
    orderFacts;
    orderItemFacts;
    userFacts;
    constructor(orderFacts, orderItemFacts, userFacts) {
        this.orderFacts = orderFacts;
        this.orderItemFacts = orderItemFacts;
        this.userFacts = userFacts;
    }
    async getMostOrderedPizzaInMonth(month, year) {
        const rows = await this.orderItemFacts.query(`
      SELECT
        f."pizzaName"                   AS "pizzaName",
        COUNT(DISTINCT f."orderId")::int AS "orderCount"
      FROM order_item_facts f
      WHERE EXTRACT(MONTH FROM f."orderedAt") = $1
        AND EXTRACT(YEAR FROM f."orderedAt") = $2
      GROUP BY f."pizzaName"
      ORDER BY "orderCount" DESC
      LIMIT 1
      `, [month, year]);
        if (rows.length === 0) {
            return null;
        }
        return {
            pizzaName: rows[0].pizzaName,
            orderCount: Number(rows[0].orderCount),
        };
    }
    async getUsersWithAboveAverageCheck() {
        const rows = await this.orderFacts.query(`
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
    async upsertOrderFact(fact) {
        await this.orderFacts.upsert(fact, ["orderId"]);
    }
    async upsertOrderItemFacts(facts) {
        if (facts.length === 0) {
            return;
        }
        await this.orderItemFacts.upsert(facts, ["orderId", "pizzaName"]);
    }
    async upsertUserFact(fact) {
        await this.userFacts.upsert(fact, ["userId"]);
    }
    async markUserDeleted(userId) {
        await this.userFacts.update({ userId }, { isDeleted: true });
    }
    async setOrderStatus(orderId, status) {
        await this.orderFacts.update({ orderId }, { status });
    }
};
AnalyticsReadModelRepository = __decorate([
    Injectable(),
    __param(0, InjectRepository(OrderFact)),
    __param(1, InjectRepository(OrderItemFact)),
    __param(2, InjectRepository(UserFact)),
    __metadata("design:paramtypes", [Repository,
        Repository,
        Repository])
], AnalyticsReadModelRepository);
export { AnalyticsReadModelRepository };
//# sourceMappingURL=analytics.repository.js.map