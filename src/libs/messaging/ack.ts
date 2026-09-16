import type { Logger } from "@nestjs/common";
import type { RmqContext } from "@nestjs/microservices";

export async function ack(
  context: RmqContext,
  logger: Logger,
  pattern: string,
  handler: () => Promise<void>
): Promise<void> {
  const channel = context.getChannelRef() as {
    ack: (msg: unknown) => void;
    nack: (msg: unknown, allUpTo: boolean, requeue: boolean) => void;
  };
  const message = context.getMessage();

  try {
    await handler();
    channel.ack(message);
  } catch (error) {
    logger.error(
      `Handler for "${pattern}" failed, routing to DLQ: ${String(error)}`,
      error instanceof Error ? error.stack : undefined
    );
    channel.nack(message, false, false);
  }
}
