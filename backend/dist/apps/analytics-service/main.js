import { bootstrapService } from "../../libs/messaging/bootstrap.js";
import { QUEUE } from "../../libs/messaging/rmq.config.js";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.js";
import { AnalyticsServiceModule } from "./analytics.module.js";
await bootstrapService(AnalyticsServiceModule, QUEUE.analytics, (app) => {
    app.useLogger(app.get(RmqLoggerService));
});
//# sourceMappingURL=main.js.map