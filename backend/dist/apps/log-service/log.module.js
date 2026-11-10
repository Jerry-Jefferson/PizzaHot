var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { MessagingModule } from "../../libs/messaging/messaging.module.js";
import { Log, LogSchema } from "./schemas/log.schema.js";
import { LogsService } from "./logs.service.js";
import { LogMessagesController } from "./log.controller.js";
let LogServiceModule = class LogServiceModule {
};
LogServiceModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            MongooseModule.forRootAsync({
                inject: [ConfigService],
                useFactory: (config) => {
                    const user = config.get("MONGO_INITDB_ROOT_USERNAME");
                    const password = config.get("MONGO_INITDB_ROOT_PASSWORD");
                    const host = config.get("MONGO_HOST");
                    const port = config.get("MONGO_PORT");
                    const db = config.get("MONGO_INITDB_DATABASE");
                    return { uri: `mongodb://${user}:${password}@${host}:${port}/${db}?authSource=admin` };
                },
            }),
            MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),
            MessagingModule.register([]),
        ],
        controllers: [LogMessagesController],
        providers: [LogsService],
    })
], LogServiceModule);
export { LogServiceModule };
//# sourceMappingURL=log.module.js.map