import { Catch, type ExceptionFilter, Logger } from "@nestjs/common";
import { throwError, type Observable } from "rxjs";
import { buildRpcErrorPayload } from "./rpc-error.ts";

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: unknown): Observable<never> {
    const payload = buildRpcErrorPayload(exception);

    if (payload.status >= 500) {
      this.logger.error(
        `Unhandled error in message handler: ${exception instanceof Error ? exception.message : JSON.stringify(exception)}`,
        exception instanceof Error ? exception.stack : undefined
      );
    }

    return throwError(() => payload);
  }
}
