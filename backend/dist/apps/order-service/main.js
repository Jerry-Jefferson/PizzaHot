import { bootstrapService } from "../../libs/messaging/bootstrap.js";
import { QUEUE } from "../../libs/messaging/rmq.config.js";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.js";
import { OrderServiceModule } from "./order.module.js";
await bootstrapService(OrderServiceModule, QUEUE.order, (app) => {
    app.useLogger(app.get(RmqLoggerService));
});
//# sourceMappingURL=main.js.map