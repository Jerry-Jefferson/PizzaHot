import { bootstrapService } from "../../libs/messaging/bootstrap.js";
import { QUEUE } from "../../libs/messaging/rmq.config.js";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.js";
import { NotificationServiceModule } from "./notification.module.js";
await bootstrapService(NotificationServiceModule, QUEUE.notification, (app) => {
    app.useLogger(app.get(RmqLoggerService));
});
//# sourceMappingURL=main.js.map