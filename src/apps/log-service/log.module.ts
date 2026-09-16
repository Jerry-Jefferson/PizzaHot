import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { MessagingModule } from "../../libs/messaging/messaging.module.ts";
import { LogsModule } from "./logs/logs.module.ts";
import { LogMessagesController } from "./log.messages.controller.ts";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const user = config.get<string>("MONGO_INITDB_ROOT_USERNAME");
        const password = config.get<string>("MONGO_INITDB_ROOT_PASSWORD");
        const host = config.get<string>("MONGO_HOST");
        const port = config.get<number>("MONGO_PORT");
        const db = config.get<string>("MONGO_INITDB_DATABASE");

        return { uri: `mongodb://${user}:${password}@${host}:${port}/${db}?authSource=admin` };
      },
    }),
    MessagingModule.register([]),
    LogsModule,
  ],
  controllers: [LogMessagesController],
})
export class LogServiceModule {}
