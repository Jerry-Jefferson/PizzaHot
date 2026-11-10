import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NotificationChannel } from "../notification-channel.constant.ts";
import { NotificationType } from "../../../libs/contracts/index.ts";
import type { NotificationChannelHandler } from "../notification.types.ts";
import type { SendNotificationParams } from "../notification.types.ts";
import type { EmailTemplate } from "../templates/account-registered.template.ts";
import { accountRegisteredTemplate } from "../templates/account-registered.template.ts";
import { accountDeletedTemplate } from "../templates/account-deleted.template.ts";
import { emailVerificationTemplate } from "../templates/email-verification.template.ts";
import { criticalErrorTemplate } from "../templates/critical-error.template.ts";
import { EmailService } from "./email.service.ts";

@Injectable()
export class EmailChannel implements NotificationChannelHandler {
  readonly channel = NotificationChannel.EMAIL;
  private readonly logger = new Logger(EmailChannel.name);
  private readonly frontendUrl: string;
  private readonly backendUrl: string;

  private static readonly SUPPORTED_TYPES = new Set<NotificationType>([
    NotificationType.ACCOUNT_REGISTERED,
    NotificationType.ACCOUNT_DELETED,
    NotificationType.EMAIL_VERIFICATION,
    NotificationType.CRITICAL_ERROR,
  ]);

  constructor(
    @Inject(EmailService)
    private readonly emailService: Pick<EmailService, "sendMail">,
    @Inject(ConfigService)
    private readonly configService: Pick<ConfigService, "get">
  ) {
    this.frontendUrl = this.configService.get<string>("FRONTEND_URL") ?? "http://localhost:3000";
    this.backendUrl = this.configService.get<string>("BACKEND_URL") ?? "http://localhost:3000";
  }

  supports(type: NotificationType): boolean {
    return EmailChannel.SUPPORTED_TYPES.has(type);
  }

  async send(params: SendNotificationParams): Promise<void> {
    const data = params.data ?? {};
    const template = this.resolveTemplate(params.type, data);

    if (!template) {
      this.logger.warn(`No email template found for notification type: ${params.type}`);
      return;
    }

    await this.emailService.sendMail(params.recipient, template.subject, template.html);
  }

  private resolveTemplate(
    type: NotificationType,
    data: Record<string, unknown>
  ): EmailTemplate | null {
    switch (type) {
      case NotificationType.ACCOUNT_REGISTERED:
        return accountRegisteredTemplate(data);
      case NotificationType.ACCOUNT_DELETED:
        return accountDeletedTemplate();
      case NotificationType.EMAIL_VERIFICATION:
        return emailVerificationTemplate(data, this.backendUrl);
      case NotificationType.CRITICAL_ERROR:
        return criticalErrorTemplate(data);
      default:
        return null;
    }
  }
}
