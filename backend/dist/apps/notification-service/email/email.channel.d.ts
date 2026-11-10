import { ConfigService } from "@nestjs/config";
import { NotificationType } from "../../../libs/contracts/index.ts";
import type { NotificationChannelHandler } from "../notification.types.ts";
import type { SendNotificationParams } from "../notification.types.ts";
import { EmailService } from "./email.service.ts";
export declare class EmailChannel implements NotificationChannelHandler {
    private readonly emailService;
    private readonly configService;
    readonly channel: "EMAIL";
    private readonly logger;
    private readonly frontendUrl;
    private readonly backendUrl;
    private static readonly SUPPORTED_TYPES;
    constructor(emailService: Pick<EmailService, "sendMail">, configService: Pick<ConfigService, "get">);
    supports(type: NotificationType): boolean;
    send(params: SendNotificationParams): Promise<void>;
    private resolveTemplate;
}
