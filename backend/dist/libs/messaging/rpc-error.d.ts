import { HttpException } from "@nestjs/common";
export interface RpcErrorPayload {
    __rpc: true;
    status: number;
    message: string;
    error: string;
}
export declare function isRpcErrorPayload(value: unknown): value is RpcErrorPayload;
export declare function buildRpcErrorPayload(exception: unknown): RpcErrorPayload;
export declare function toHttpException(error: unknown): HttpException;
