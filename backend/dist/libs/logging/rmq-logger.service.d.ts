import { ConsoleLogger, type LoggerService } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
export declare class RmqLoggerService extends ConsoleLogger implements LoggerService {
    private readonly client?;
    private readonly serviceName;
    constructor(client?: ClientProxy);
    log(message: unknown, ...optionalParams: unknown[]): void;
    error(message: unknown, ...optionalParams: unknown[]): void;
    private publish;
    private shape;
    private static stringify;
}
