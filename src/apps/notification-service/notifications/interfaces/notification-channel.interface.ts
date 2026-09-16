import { NotificationChannel } from "../constants/notification-channel.constant.ts";
import { NotificationType } from "../../../../libs/contracts/notification-type.constant.ts";
import { SendNotificationParams } from "./send-notification-params.interface.ts";

export interface NotificationChannelHandler {
  readonly channel: NotificationChannel;
  supports(type: NotificationType): boolean;
  send(params: SendNotificationParams): Promise<void>;
}
