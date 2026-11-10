import { NotificationChannel } from "./notification-channel.constant.ts";
import { NotificationType } from "../../libs/contracts/index.ts";

export interface NotificationChannelHandler {
  readonly channel: NotificationChannel;
  supports(type: NotificationType): boolean;
  send(params: SendNotificationParams): Promise<void>;
}

export interface NotificationPayload {
  type: NotificationType;
  recipient: string;
  data?: Record<string, unknown>;
}

export interface SendNotificationParams {
  type: NotificationType;
  recipient: string;
  data?: Record<string, unknown>;
}
