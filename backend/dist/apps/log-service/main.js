import { bootstrapService } from "../../libs/messaging/bootstrap.js";
import { QUEUE } from "../../libs/messaging/rmq.config.js";
import { LogServiceModule } from "./log.module.js";
await bootstrapService(LogServiceModule, QUEUE.log);
//# sourceMappingURL=main.js.map