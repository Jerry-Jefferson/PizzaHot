import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { rmqOptions } from "./rmq.config.js";
import { RpcExceptionFilter } from "./rpc-exception.filter.js";
import { RpcAckInterceptor } from "./rpc-ack.interceptor.js";
export async function bootstrapService(rootModule, queue, configure) {
    const app = await NestFactory.createMicroservice(rootModule, {
        ...rmqOptions(queue),
        bufferLogs: true,
    });
    app.useGlobalFilters(new RpcExceptionFilter());
    app.useGlobalInterceptors(new RpcAckInterceptor());
    app.enableShutdownHooks();
    configure?.(app);
    await app.listen();
    Logger.log(`listening on ${queue}`, "Bootstrap");
}
//# sourceMappingURL=bootstrap.js.map