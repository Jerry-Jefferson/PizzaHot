var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PromocodeRedemption } from "./promocode-redemption.entity.js";
import { RedemptionsRepository } from "./redemptions.repository.js";
import { RedemptionsService } from "./redemptions.service.js";
import { REDEMPTIONS_REPOSITORY } from "../../../libs/database/tokens.js";
let RedemptionsModule = class RedemptionsModule {
};
RedemptionsModule = __decorate([
    Module({
        imports: [TypeOrmModule.forFeature([PromocodeRedemption])],
        providers: [
            RedemptionsRepository,
            { provide: REDEMPTIONS_REPOSITORY, useExisting: RedemptionsRepository },
            RedemptionsService,
        ],
        exports: [RedemptionsService],
    })
], RedemptionsModule);
export { RedemptionsModule };
//# sourceMappingURL=redemptions.module.js.map