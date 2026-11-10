export declare const NotificationType: {
    readonly ACCOUNT_REGISTERED: "ACCOUNT_REGISTERED";
    readonly ACCOUNT_DELETED: "ACCOUNT_DELETED";
    readonly EMAIL_VERIFICATION: "EMAIL_VERIFICATION";
    readonly CRITICAL_ERROR: "CRITICAL_ERROR";
};
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
