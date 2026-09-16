import { Transport, type RmqOptions } from "@nestjs/microservices";

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
} as const;

export type QueueName = (typeof QUEUE)[keyof typeof QUEUE];

export function rabbitUrl(): string {
  return process.env.RABBITMQ_URL ?? "amqp://localhost:5672";
}

export function rmqOptions(queue: QueueName, prefetchCount = 10): RmqOptions {
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
