export const NotificationType = {
  ACCOUNT_REGISTERED: "ACCOUNT_REGISTERED",
  ACCOUNT_DELETED: "ACCOUNT_DELETED",
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
  CRITICAL_ERROR: "CRITICAL_ERROR",
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
