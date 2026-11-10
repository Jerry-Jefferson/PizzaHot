import { bootstrapService } from "../../libs/messaging/bootstrap.js";
import { QUEUE } from "../../libs/messaging/rmq.config.js";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.js";
import { PromocodeServiceModule } from "./promocode.module.js";
await bootstrapService(PromocodeServiceModule, QUEUE.promocode, (app) => {
    app.useLogger(app.get(RmqLoggerService));
});
//# sourceMappingURL=main.js.map