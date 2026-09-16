import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderFact } from "../readmodel/entities/order-fact.entity.ts";
import { OrderItemFact } from "../readmodel/entities/order-item-fact.entity.ts";
import { UserFact } from "../readmodel/entities/user-fact.entity.ts";
import { AnalyticsReadModelRepository } from "./analytics.readmodel.repository.ts";
import { AnalyticsService } from "./analytics.service.ts";
import { ANALYTICS_REPOSITORY } from "../../../libs/common/database/tokens.ts";

@Module({
  imports: [TypeOrmModule.forFeature([OrderFact, OrderItemFact, UserFact])],
  providers: [
    AnalyticsReadModelRepository,
    { provide: ANALYTICS_REPOSITORY, useExisting: AnalyticsReadModelRepository },
    AnalyticsService,
  ],
  exports: [AnalyticsService, AnalyticsReadModelRepository],
})
export class AnalyticsModule {}
