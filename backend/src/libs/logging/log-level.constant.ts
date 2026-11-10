export const LogLevel = {
  INFO: "info",
  ERROR: "error",
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];
