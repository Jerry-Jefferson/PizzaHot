import { type RmqOptions } from "@nestjs/microservices";
export declare const EVENTS_EXCHANGE = "pizzahot.events";
export declare const QUEUE: {
    readonly identity: "q.identity";
    readonly catalog: "q.catalog";
    readonly cart: "q.cart";
    readonly order: "q.order";
    readonly promocode: "q.promocode";
    readonly notification: "q.notification";
    readonly analytics: "q.analytics";
    readonly log: "q.log";
};
export type QueueName = (typeof QUEUE)[keyof typeof QUEUE];
export declare function rabbitUrl(): string;
export declare function rmqOptions(queue: QueueName, prefetchCount?: number): RmqOptions;
