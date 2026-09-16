import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MessagingModule } from "../../libs/messaging/messaging.module.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { NotificationsModule } from "./notifications/notifications.module.ts";
import { NotificationsMessagesController } from "./notifications.messages.controller.ts";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MessagingModule.register([]),
    NotificationsModule,
  ],
  controllers: [NotificationsMessagesController],
  providers: [RmqLoggerService],
})
export class NotificationServiceModule {}
