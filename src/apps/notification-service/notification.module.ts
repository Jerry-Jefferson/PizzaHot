import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MessagingModule } from "../../libs/messaging/messaging.module.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { EmailModule } from "./email/email.module.ts";
import { EmailChannel } from "./email/email.channel.ts";
import { NotificationsService } from "./notifications.service.ts";
import { NOTIFICATION_CHANNELS } from "./notification-channel.constant.ts";
import type { NotificationChannelHandler } from "./notification.types.ts";
import { NotificationsMessagesController } from "./notifications.controller.ts";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MessagingModule.register([]), EmailModule],
  controllers: [NotificationsMessagesController],
  providers: [
    {
      provide: NOTIFICATION_CHANNELS,
      useFactory: (emailChannel: EmailChannel): NotificationChannelHandler[] => [emailChannel],
      inject: [EmailChannel],
    },
    NotificationsService,
    RmqLoggerService,
  ],
})
export class NotificationServiceModule {}
