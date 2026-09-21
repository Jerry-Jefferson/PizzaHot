export const RedemptionStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
} as const;

export type RedemptionStatus = (typeof RedemptionStatus)[keyof typeof RedemptionStatus];
