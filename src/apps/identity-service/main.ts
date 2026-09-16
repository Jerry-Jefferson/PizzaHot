import { bootstrapService } from "../../libs/messaging/bootstrap.ts";
import { QUEUE } from "../../libs/messaging/rmq.config.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { IdentityServiceModule } from "./identity.module.ts";

await bootstrapService(IdentityServiceModule, QUEUE.identity, (app) => {
  app.useLogger(app.get(RmqLoggerService));
});
