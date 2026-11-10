import { CanActivate, type ExecutionContext } from "@nestjs/common";
import type { RpcSender } from "../../messaging/message-client.types.ts";
export declare class EmailVerifiedGuard implements CanActivate {
    private readonly identityClient;
    private readonly logger;
    constructor(identityClient: RpcSender);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
