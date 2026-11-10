import { Global, Module, type DynamicModule } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { EVENTS_EXCHANGE, QUEUE, rabbitUrl, type QueueName } from "./rmq.config.ts";
import {
  ANALYTICS_CLIENT,
  CART_CLIENT,
  CATALOG_CLIENT,
  EVENTS_CLIENT,
  IDENTITY_CLIENT,
  LOG_CLIENT,
  NOTIFICATION_CLIENT,
  ORDER_CLIENT,
  PROMOCODE_CLIENT,
} from "./tokens.constant.ts";

const QUEUE_BY_TOKEN: Record<string, QueueName> = {
  [IDENTITY_CLIENT]: QUEUE.identity,
  [CATALOG_CLIENT]: QUEUE.catalog,
  [CART_CLIENT]: QUEUE.cart,
  [ORDER_CLIENT]: QUEUE.order,
  [PROMOCODE_CLIENT]: QUEUE.promocode,
  [NOTIFICATION_CLIENT]: QUEUE.notification,
  [ANALYTICS_CLIENT]: QUEUE.analytics,
  [LOG_CLIENT]: QUEUE.log,
};

@Global()
@Module({})
export class MessagingModule {
  static register(tokens: string[]): DynamicModule {
    const clients = tokens.map((token) => ({
      name: token,
      transport: Transport.RMQ as const,
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
      transport: Transport.RMQ as const,
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
      module: MessagingModule,
      imports: [imported],
      exports: [imported],
    };
  }
}
