import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/database/typeorm.config.ts";
import { MessagingModule } from "../../libs/messaging/messaging.module.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { User } from "./users/user.entity.ts";
import { UsersModule } from "./users/users.module.ts";
import { AuthModule } from "./auth/auth.module.ts";
import { IdentityMessagesController } from "./identity.controller.ts";
import { SeedService } from "./seed.service.ts";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig("identity_db", [User])),
    MessagingModule.register([]),
    UsersModule,
    AuthModule,
  ],
  controllers: [IdentityMessagesController],
  providers: [RmqLoggerService, SeedService],
})
export class IdentityServiceModule {}
