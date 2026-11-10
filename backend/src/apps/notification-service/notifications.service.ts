import { Inject, Injectable, Logger } from "@nestjs/common";
import { NOTIFICATION_CHANNELS } from "./notification-channel.constant.ts";
import type { NotificationChannelHandler } from "./notification.types.ts";
import type { SendNotificationParams } from "./notification.types.ts";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(NOTIFICATION_CHANNELS)
    private readonly channels: NotificationChannelHandler[]
  ) {}

  async send(params: SendNotificationParams): Promise<void> {
    const supportedChannels = this.channels.filter((channel) => channel.supports(params.type));

    if (supportedChannels.length === 0) {
      this.logger.warn(`No channel available to handle notification type: ${params.type}`);
      return;
    }

    await Promise.allSettled(
      supportedChannels.map(async (channel) => {
        try {
          await channel.send(params);
        } catch (error) {
          this.logger.error(
            `Failed to send notification [${params.type}] via channel [${channel.channel}]: ${error}`
          );
        }
      })
    );
  }
}
