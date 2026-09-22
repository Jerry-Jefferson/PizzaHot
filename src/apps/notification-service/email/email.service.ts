import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { type Transporter } from "nodemailer";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    this.from = this.configService.get<string>("SMTP_FROM") ?? "no-reply@pizzahot.local";

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST") ?? "localhost",
      port: this.configService.get<number>("SMTP_PORT") ?? 1025,
      auth: this.getAuth(),
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: "${subject}"`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error}`);
      throw error;
    }
  }

  private getAuth(): { user: string; pass: string } | undefined {
    const user = this.configService.get<string>("SMTP_USER");
    const pass = this.configService.get<string>("SMTP_PASSWORD");

    if (user && pass) {
      return { user, pass };
    }

    return undefined;
  }
}
