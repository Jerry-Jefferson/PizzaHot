import {
  Injectable,
  Logger,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import type { RmqContext } from "@nestjs/microservices";
import { finalize, type Observable } from "rxjs";

interface AckChannel {
  ack: (msg: unknown) => void;
}

interface RmqMessage {
  properties?: { replyTo?: string };
}

@Injectable()
export class RpcAckInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RpcAckInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "rpc") {
      return next.handle();
    }

    const rmqContext = context.switchToRpc().getContext<RmqContext>();
    const message = rmqContext.getMessage?.() as RmqMessage | undefined;

    if (!message?.properties?.replyTo) {
      return next.handle();
    }

    const channel = rmqContext.getChannelRef() as AckChannel;

    return next.handle().pipe(
      finalize(() => {
        try {
          channel.ack(message);
        } catch (error) {
          this.logger.error(`Failed to ack RPC delivery: ${String(error)}`);
        }
      })
    );
  }
}
