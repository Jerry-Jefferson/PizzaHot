import { Inject, Injectable } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { ANALYTICS_CLIENT, LOG_CLIENT } from "../../../libs/messaging/tokens.constant.ts";
import { RPC } from "../../../libs/contracts/index.ts";
import { rpc } from "../../../libs/messaging/rpc.util.ts";
import type { ListLogsQuery } from "../../log-service/schemas/log-query.schema.ts";
import type { Log } from "../../log-service/schemas/log.schema.ts";
import type { PaginatedResponseDto } from "../../../libs/common/pagination/paginated-response.dto.ts";
import type {
  MostOrderedPizzaResult,
  UserAboveAverageCheckResult,
} from "../../analytics-service/analytics.types.ts";

@Injectable()
export class AnalyticsClient {
  constructor(@Inject(ANALYTICS_CLIENT) private readonly client: ClientProxy) {}

  getMostOrderedPizzaInMonth(month: number, year: number): Promise<MostOrderedPizzaResult | null> {
    return rpc(this.client, RPC.analytics.popularPizza, { month, year });
  }

  getUsersWithAboveAverageCheck(): Promise<UserAboveAverageCheckResult[]> {
    return rpc(this.client, RPC.analytics.highestChecks, {});
  }
}

@Injectable()
export class LogClient {
  constructor(@Inject(LOG_CLIENT) private readonly client: ClientProxy) {}

  findAll(query: ListLogsQuery): Promise<PaginatedResponseDto<Log>> {
    return rpc(this.client, RPC.log.query, query);
  }
}
