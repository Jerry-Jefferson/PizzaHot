import { bootstrapService } from "../../libs/messaging/bootstrap.ts";
import { QUEUE } from "../../libs/messaging/rmq.config.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { PromocodeServiceModule } from "./promocode.module.ts";

await bootstrapService(PromocodeServiceModule, QUEUE.promocode, (app) => {
  app.useLogger(app.get(RmqLoggerService));
});
