import { Transport } from "@nestjs/microservices";
export const EVENTS_EXCHANGE = "pizzahot.events";
export const QUEUE = {
    identity: "q.identity",
    catalog: "q.catalog",
    cart: "q.cart",
    order: "q.order",
    promocode: "q.promocode",
    notification: "q.notification",
    analytics: "q.analytics",
    log: "q.log",
};
export function rabbitUrl() {
    return process.env.RABBITMQ_URL ?? "amqp://localhost:5672";
}
export function rmqOptions(queue, prefetchCount = 10) {
    return {
        transport: Transport.RMQ,
        options: {
            urls: [rabbitUrl()],
            queue,
            exchange: EVENTS_EXCHANGE,
            exchangeType: "topic",
            wildcards: true,
            queueOptions: { durable: true },
            persistent: true,
            noAck: false,
            prefetchCount,
        },
    };
}
//# sourceMappingURL=rmq.config.js.map