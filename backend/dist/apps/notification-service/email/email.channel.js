var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmailChannel_1;
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NotificationChannel } from "../notification-channel.constant.js";
import { NotificationType } from "../../../libs/contracts/index.js";
import { accountRegisteredTemplate } from "../templates/account-registered.template.js";
import { accountDeletedTemplate } from "../templates/account-deleted.template.js";
import { emailVerificationTemplate } from "../templates/email-verification.template.js";
import { criticalErrorTemplate } from "../templates/critical-error.template.js";
import { EmailService } from "./email.service.js";
let EmailChannel = class EmailChannel {
    static { EmailChannel_1 = this; }
    emailService;
    configService;
    channel = NotificationChannel.EMAIL;
    logger = new Logger(EmailChannel_1.name);
    frontendUrl;
    backendUrl;
    static SUPPORTED_TYPES = new Set([
        NotificationType.ACCOUNT_REGISTERED,
        NotificationType.ACCOUNT_DELETED,
        NotificationType.EMAIL_VERIFICATION,
        NotificationType.CRITICAL_ERROR,
    ]);
    constructor(emailService, configService) {
        this.emailService = emailService;
        this.configService = configService;
        this.frontendUrl = this.configService.get("FRONTEND_URL") ?? "http://localhost:3000";
        this.backendUrl = this.configService.get("BACKEND_URL") ?? "http://localhost:3000";
    }
    supports(type) {
        return EmailChannel_1.SUPPORTED_TYPES.has(type);
    }
    async send(params) {
        const data = params.data ?? {};
        const template = this.resolveTemplate(params.type, data);
        if (!template) {
            this.logger.warn(`No email template found for notification type: ${params.type}`);
            return;
        }
        await this.emailService.sendMail(params.recipient, template.subject, template.html);
    }
    resolveTemplate(type, data) {
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
};
EmailChannel = EmailChannel_1 = __decorate([
    Injectable(),
    __param(0, Inject(EmailService)),
    __param(1, Inject(ConfigService)),
    __metadata("design:paramtypes", [Object, Object])
], EmailChannel);
export { EmailChannel };
//# sourceMappingURL=email.channel.js.map