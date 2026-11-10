import { type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import type { EventPublisher } from "../messaging/message-client.types.ts";
export declare class CriticalErrorFilter implements ExceptionFilter {
    private readonly events;
    private readonly logger;
    constructor(events: EventPublisher);
    catch(exception: unknown, host: ArgumentsHost): void;
}
