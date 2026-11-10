var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RpcAckInterceptor_1;
import { Injectable, Logger, } from "@nestjs/common";
import { finalize } from "rxjs";
let RpcAckInterceptor = RpcAckInterceptor_1 = class RpcAckInterceptor {
    logger = new Logger(RpcAckInterceptor_1.name);
    intercept(context, next) {
        if (context.getType() !== "rpc") {
            return next.handle();
        }
        const rmqContext = context.switchToRpc().getContext();
        const message = rmqContext.getMessage?.();
        if (!message?.properties?.replyTo) {
            return next.handle();
        }
        const channel = rmqContext.getChannelRef();
        return next.handle().pipe(finalize(() => {
            try {
                channel.ack(message);
            }
            catch (error) {
                this.logger.error(`Failed to ack RPC delivery: ${String(error)}`);
            }
        }));
    }
};
RpcAckInterceptor = RpcAckInterceptor_1 = __decorate([
    Injectable()
], RpcAckInterceptor);
export { RpcAckInterceptor };
//# sourceMappingURL=rpc-ack.interceptor.js.map