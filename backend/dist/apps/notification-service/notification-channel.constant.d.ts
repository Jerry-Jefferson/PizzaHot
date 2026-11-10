export declare const NotificationChannel: {
    readonly EMAIL: "EMAIL";
    readonly IN_APP: "IN_APP";
};
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];
export declare const NOTIFICATION_CHANNELS = "NOTIFICATION_CHANNELS";
