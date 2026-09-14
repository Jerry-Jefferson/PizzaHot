import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Log, LogSchema } from "./schemas/log.schema.ts";
import { LogsService } from "./logs.service.ts";
import { MongoLoggerService } from "./mongo-logger.service.ts";
import { LogsController } from "./logs.controller.ts";
import { HttpLoggingInterceptor } from "./interceptors/http-logging.interceptor.ts";

@Module({
  imports: [MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }])],
  controllers: [LogsController],
  providers: [LogsService, MongoLoggerService, HttpLoggingInterceptor],
  exports: [LogsService, MongoLoggerService, HttpLoggingInterceptor],
})
export class LogsModule {}
