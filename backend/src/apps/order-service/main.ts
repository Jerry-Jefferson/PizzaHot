import { bootstrapService } from "../../libs/messaging/bootstrap.ts";
import { QUEUE } from "../../libs/messaging/rmq.config.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { OrderServiceModule } from "./order.module.ts";

await bootstrapService(OrderServiceModule, QUEUE.order, (app) => {
  app.useLogger(app.get(RmqLoggerService));
});
