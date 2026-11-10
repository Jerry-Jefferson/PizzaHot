var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new Logger(EmailService_1.name);
    transporter;
    from;
    constructor(configService) {
        this.configService = configService;
        this.from = this.configService.get("SMTP_FROM") ?? "no-reply@pizzahot.local";
        this.transporter = nodemailer.createTransport({
            host: this.configService.get("SMTP_HOST") ?? "localhost",
            port: this.configService.get("SMTP_PORT") ?? 1025,
            auth: this.getAuth(),
        });
    }
    async sendMail(to, subject, html) {
        try {
            await this.transporter.sendMail({
                from: this.from,
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent to ${to}: "${subject}"`);
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error}`);
            throw error;
        }
    }
    getAuth() {
        const user = this.configService.get("SMTP_USER");
        const pass = this.configService.get("SMTP_PASSWORD");
        if (user && pass) {
            return { user, pass };
        }
        return undefined;
    }
};
EmailService = EmailService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], EmailService);
export { EmailService };
//# sourceMappingURL=email.service.js.map