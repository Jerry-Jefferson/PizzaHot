export interface EmailTemplate {
    subject: string;
    html: string;
}
export declare function accountRegisteredTemplate(data: Record<string, unknown>): EmailTemplate;
