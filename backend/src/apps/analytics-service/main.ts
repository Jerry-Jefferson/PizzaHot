import { bootstrapService } from "../../libs/messaging/bootstrap.ts";
import { QUEUE } from "../../libs/messaging/rmq.config.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { AnalyticsServiceModule } from "./analytics.module.ts";

await bootstrapService(AnalyticsServiceModule, QUEUE.analytics, (app) => {
  app.useLogger(app.get(RmqLoggerService));
});
