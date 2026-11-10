import { bootstrapService } from "../../libs/messaging/bootstrap.ts";
import { QUEUE } from "../../libs/messaging/rmq.config.ts";
import { LogServiceModule } from "./log.module.ts";

await bootstrapService(LogServiceModule, QUEUE.log);
