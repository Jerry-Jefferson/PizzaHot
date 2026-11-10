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
var NotificationsService_1;
import { Inject, Injectable, Logger } from "@nestjs/common";
import { NOTIFICATION_CHANNELS } from "./notification-channel.constant.js";
let NotificationsService = NotificationsService_1 = class NotificationsService {
    channels;
    logger = new Logger(NotificationsService_1.name);
    constructor(channels) {
        this.channels = channels;
    }
    async send(params) {
        const supportedChannels = this.channels.filter((channel) => channel.supports(params.type));
        if (supportedChannels.length === 0) {
            this.logger.warn(`No channel available to handle notification type: ${params.type}`);
            return;
        }
        await Promise.allSettled(supportedChannels.map(async (channel) => {
            try {
                await channel.send(params);
            }
            catch (error) {
                this.logger.error(`Failed to send notification [${params.type}] via channel [${channel.channel}]: ${error}`);
            }
        }));
    }
};
NotificationsService = NotificationsService_1 = __decorate([
    Injectable(),
    __param(0, Inject(NOTIFICATION_CHANNELS)),
    __metadata("design:paramtypes", [Array])
], NotificationsService);
export { NotificationsService };
//# sourceMappingURL=notifications.service.js.map