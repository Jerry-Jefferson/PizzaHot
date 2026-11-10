import type { RpcSender } from "./message-client.types.ts";
export declare const RPC_TIMEOUT_MS: number;
export declare function rpc<T>(client: RpcSender, pattern: string, data?: unknown): Promise<T>;
