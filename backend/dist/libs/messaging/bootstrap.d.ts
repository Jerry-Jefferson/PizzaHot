import { type DynamicModule, type INestMicroservice, type Type } from "@nestjs/common";
import { type QueueName } from "./rmq.config.ts";
export declare function bootstrapService(rootModule: Type<unknown> | DynamicModule, queue: QueueName, configure?: (app: INestMicroservice) => void): Promise<void>;
