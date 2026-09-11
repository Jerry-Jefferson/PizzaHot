import { NotificationType } from "../constants/notification-type.constant.ts";

export interface SendNotificationParams {
  type: NotificationType;
  recipient: string;
  data?: Record<string, unknown>;
}
