var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RpcExceptionFilter_1;
import { Catch, Logger } from "@nestjs/common";
import { throwError } from "rxjs";
import { buildRpcErrorPayload } from "./rpc-error.js";
let RpcExceptionFilter = RpcExceptionFilter_1 = class RpcExceptionFilter {
    logger = new Logger(RpcExceptionFilter_1.name);
    catch(exception) {
        const payload = buildRpcErrorPayload(exception);
        if (payload.status >= 500) {
            this.logger.error(`Unhandled error in message handler: ${exception instanceof Error ? exception.message : JSON.stringify(exception)}`, exception instanceof Error ? exception.stack : undefined);
        }
        return throwError(() => payload);
    }
};
RpcExceptionFilter = RpcExceptionFilter_1 = __decorate([
    Catch()
], RpcExceptionFilter);
export { RpcExceptionFilter };
//# sourceMappingURL=rpc-exception.filter.js.map