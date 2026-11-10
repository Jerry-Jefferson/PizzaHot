export async function ack(context, logger, pattern, handler) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
        await handler();
        channel.ack(message);
    }
    catch (error) {
        logger.error(`Handler for "${pattern}" failed, routing to DLQ: ${String(error)}`, error instanceof Error ? error.stack : undefined);
        channel.nack(message, false, false);
    }
}
//# sourceMappingURL=ack.js.map