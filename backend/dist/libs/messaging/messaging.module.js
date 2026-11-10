var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MessagingModule_1;
import { Global, Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { EVENTS_EXCHANGE, QUEUE, rabbitUrl } from "./rmq.config.js";
import { ANALYTICS_CLIENT, CART_CLIENT, CATALOG_CLIENT, EVENTS_CLIENT, IDENTITY_CLIENT, LOG_CLIENT, NOTIFICATION_CLIENT, ORDER_CLIENT, PROMOCODE_CLIENT, } from "./tokens.constant.js";
const QUEUE_BY_TOKEN = {
    [IDENTITY_CLIENT]: QUEUE.identity,
    [CATALOG_CLIENT]: QUEUE.catalog,
    [CART_CLIENT]: QUEUE.cart,
    [ORDER_CLIENT]: QUEUE.order,
    [PROMOCODE_CLIENT]: QUEUE.promocode,
    [NOTIFICATION_CLIENT]: QUEUE.notification,
    [ANALYTICS_CLIENT]: QUEUE.analytics,
    [LOG_CLIENT]: QUEUE.log,
};
let MessagingModule = MessagingModule_1 = class MessagingModule {
    static register(tokens) {
        const clients = tokens.map((token) => ({
            name: token,
            transport: Transport.RMQ,
            options: {
                urls: [rabbitUrl()],
                queue: QUEUE_BY_TOKEN[token] ?? QUEUE.log,
                exchange: EVENTS_EXCHANGE,
                exchangeType: "topic",
                wildcards: true,
                queueOptions: { durable: true },
                persistent: true,
            },
        }));
        const eventsClient = {
            name: EVENTS_CLIENT,
            transport: Transport.RMQ,
            options: {
                urls: [rabbitUrl()],
                queue: "",
                exchange: EVENTS_EXCHANGE,
                exchangeType: "topic",
                wildcards: true,
                queueOptions: { durable: true },
                persistent: true,
            },
        };
        const imported = ClientsModule.register([...clients, eventsClient]);
        return {
            module: MessagingModule_1,
            imports: [imported],
            exports: [imported],
        };
    }
};
MessagingModule = MessagingModule_1 = __decorate([
    Global(),
    Module({})
], MessagingModule);
export { MessagingModule };
//# sourceMappingURL=messaging.module.js.map