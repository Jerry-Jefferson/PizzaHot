import { NotificationType } from "../constants/notification-type.constant.ts";

export interface NotificationPayload {
  type: NotificationType;
  recipient: string;
  data?: Record<string, unknown>;
}
