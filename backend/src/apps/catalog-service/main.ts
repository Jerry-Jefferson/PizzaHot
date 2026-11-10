import { bootstrapService } from "../../libs/messaging/bootstrap.ts";
import { QUEUE } from "../../libs/messaging/rmq.config.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { CatalogServiceModule } from "./catalog.module.ts";

await bootstrapService(CatalogServiceModule, QUEUE.catalog, (app) => {
  app.useLogger(app.get(RmqLoggerService));
});
