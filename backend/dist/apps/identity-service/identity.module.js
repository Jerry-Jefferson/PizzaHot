var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/database/typeorm.config.js";
import { MessagingModule } from "../../libs/messaging/messaging.module.js";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.js";
import { User } from "./users/user.entity.js";
import { UsersModule } from "./users/users.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { IdentityMessagesController } from "./identity.controller.js";
let IdentityServiceModule = class IdentityServiceModule {
};
IdentityServiceModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            TypeOrmModule.forRoot(typeOrmConfig("identity_db", [User])),
            MessagingModule.register([]),
            UsersModule,
            AuthModule,
        ],
        controllers: [IdentityMessagesController],
        providers: [RmqLoggerService],
    })
], IdentityServiceModule);
export { IdentityServiceModule };
//# sourceMappingURL=identity.module.js.map