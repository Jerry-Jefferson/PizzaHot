export declare const LogLevel: {
    readonly INFO: "info";
    readonly ERROR: "error";
};
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];
