export const NotificationChannel = {
  EMAIL: "EMAIL",
  IN_APP: "IN_APP",
} as const;

export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NOTIFICATION_CHANNELS = "NOTIFICATION_CHANNELS";
