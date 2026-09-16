import { bootstrapService } from "../../libs/messaging/bootstrap.ts";
import { QUEUE } from "../../libs/messaging/rmq.config.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { CartServiceModule } from "./cart.module.ts";

await bootstrapService(CartServiceModule, QUEUE.cart, (app) => {
  app.useLogger(app.get(RmqLoggerService));
});
