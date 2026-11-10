var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MessagingModule } from "../../libs/messaging/messaging.module.js";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.js";
import { EmailModule } from "./email/email.module.js";
import { EmailChannel } from "./email/email.channel.js";
import { NotificationsService } from "./notifications.service.js";
import { NOTIFICATION_CHANNELS } from "./notification-channel.constant.js";
import { NotificationsMessagesController } from "./notifications.controller.js";
let NotificationServiceModule = class NotificationServiceModule {
};
NotificationServiceModule = __decorate([
    Module({
        imports: [ConfigModule.forRoot({ isGlobal: true }), MessagingModule.register([]), EmailModule],
        controllers: [NotificationsMessagesController],
        providers: [
            {
                provide: NOTIFICATION_CHANNELS,
                useFactory: (emailChannel) => [emailChannel],
                inject: [EmailChannel],
            },
            NotificationsService,
            RmqLoggerService,
        ],
    })
], NotificationServiceModule);
export { NotificationServiceModule };
//# sourceMappingURL=notification.module.js.map