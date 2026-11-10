import type { Logger } from "@nestjs/common";
import type { RmqContext } from "@nestjs/microservices";
export declare function ack(context: RmqContext, logger: Logger, pattern: string, handler: () => Promise<void>): Promise<void>;
