var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsMessagesController_1;
import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { EVENTS, NotificationType } from "../../libs/contracts/index.js";
import { NotificationsService } from "./notifications.service.js";
import { ack } from "../../libs/messaging/ack.js";
let NotificationsMessagesController = NotificationsMessagesController_1 = class NotificationsMessagesController {
    notifications;
    logger = new Logger(NotificationsMessagesController_1.name);
    constructor(notifications) {
        this.notifications = notifications;
    }
    async onUserRegistered(event, context) {
        await ack(context, this.logger, EVENTS.userRegistered, async () => {
            await this.notifications.send({
                type: NotificationType.ACCOUNT_REGISTERED,
                recipient: event.email,
                data: { name: event.name },
            });
            await this.notifications.send({
                type: NotificationType.EMAIL_VERIFICATION,
                recipient: event.email,
                data: { name: event.name, verificationToken: event.verificationToken },
            });
        });
    }
    async onUserDeleted(event, context) {
        await ack(context, this.logger, EVENTS.userDeleted, () => this.notifications.send({
            type: NotificationType.ACCOUNT_DELETED,
            recipient: event.email,
            data: { name: event.name },
        }));
    }
    async onOrderStatusChanged(event, context) {
        await ack(context, this.logger, EVENTS.orderStatusChanged, () => {
            this.logger.log(`Order ${event.orderId} moved to ${event.status}`);
            return Promise.resolve();
        });
    }
    async onCriticalError(event, context) {
        await ack(context, this.logger, EVENTS.criticalError, () => this.notifications.send({
            type: NotificationType.CRITICAL_ERROR,
            recipient: process.env.CRITICAL_ERROR_EMAIL ?? "admin@pizzahot.local",
            data: { ...event },
        }));
    }
};
__decorate([
    EventPattern(EVENTS.userRegistered),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], NotificationsMessagesController.prototype, "onUserRegistered", null);
__decorate([
    EventPattern(EVENTS.userDeleted),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], NotificationsMessagesController.prototype, "onUserDeleted", null);
__decorate([
    EventPattern(EVENTS.orderStatusChanged),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], NotificationsMessagesController.prototype, "onOrderStatusChanged", null);
__decorate([
    EventPattern(EVENTS.criticalError),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], NotificationsMessagesController.prototype, "onCriticalError", null);
NotificationsMessagesController = NotificationsMessagesController_1 = __decorate([
    Controller(),
    __metadata("design:paramtypes", [NotificationsService])
], NotificationsMessagesController);
export { NotificationsMessagesController };
//# sourceMappingURL=notifications.controller.js.map