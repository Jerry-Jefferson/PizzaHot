import type { NotificationChannelHandler } from "./notification.types.ts";
import type { SendNotificationParams } from "./notification.types.ts";
export declare class NotificationsService {
    private readonly channels;
    private readonly logger;
    constructor(channels: NotificationChannelHandler[]);
    send(params: SendNotificationParams): Promise<void>;
}
