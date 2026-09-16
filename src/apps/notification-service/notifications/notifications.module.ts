import { Module } from "@nestjs/common";
import { EmailModule } from "./channels/email/email.module.ts";
import { EmailChannel } from "./channels/email/email.channel.ts";
import { NotificationsService } from "./notifications.service.ts";
import { NOTIFICATION_CHANNELS } from "./constants/notification-channel.constant.ts";
import type { NotificationChannelHandler } from "./interfaces/notification-channel.interface.ts";

@Module({
  imports: [EmailModule],
  providers: [
    {
      provide: NOTIFICATION_CHANNELS,
      useFactory: (emailChannel: EmailChannel): NotificationChannelHandler[] => [emailChannel],
      inject: [EmailChannel],
    },
    NotificationsService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
