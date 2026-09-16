import { Logger, type INestMicroservice } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { MicroserviceOptions } from "@nestjs/microservices";
import { rmqOptions, type QueueName } from "./rmq.config.ts";
import { RpcExceptionFilter } from "./rpc-exception.filter.ts";
import { RpcAckInterceptor } from "./rpc-ack.interceptor.ts";

export async function bootstrapService(
  rootModule: unknown,
  queue: QueueName,
  configure?: (app: INestMicroservice) => void
): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(rootModule as never, {
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
