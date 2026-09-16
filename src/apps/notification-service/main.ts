import { bootstrapService } from "../../libs/messaging/bootstrap.ts";
import { QUEUE } from "../../libs/messaging/rmq.config.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { NotificationServiceModule } from "./notification.module.ts";

await bootstrapService(NotificationServiceModule, QUEUE.notification, (app) => {
  app.useLogger(app.get(RmqLoggerService));
});
