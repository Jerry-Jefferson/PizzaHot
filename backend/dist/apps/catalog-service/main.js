import { bootstrapService } from "../../libs/messaging/bootstrap.js";
import { QUEUE } from "../../libs/messaging/rmq.config.js";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.js";
import { CatalogServiceModule } from "./catalog.module.js";
await bootstrapService(CatalogServiceModule, QUEUE.catalog, (app) => {
    app.useLogger(app.get(RmqLoggerService));
});
//# sourceMappingURL=main.js.map