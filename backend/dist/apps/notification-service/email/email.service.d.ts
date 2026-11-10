import { ConfigService } from "@nestjs/config";
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private readonly transporter;
    private readonly from;
    constructor(configService: ConfigService);
    sendMail(to: string, subject: string, html: string): Promise<void>;
    private getAuth;
}
