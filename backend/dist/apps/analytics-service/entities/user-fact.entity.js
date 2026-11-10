var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, PrimaryColumn } from "typeorm";
let UserFact = class UserFact {
    userId;
    email;
    name;
    isDeleted;
};
__decorate([
    PrimaryColumn({ type: "uuid" }),
    __metadata("design:type", String)
], UserFact.prototype, "userId", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], UserFact.prototype, "email", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], UserFact.prototype, "name", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], UserFact.prototype, "isDeleted", void 0);
UserFact = __decorate([
    Entity("user_facts")
], UserFact);
export { UserFact };
//# sourceMappingURL=user-fact.entity.js.map