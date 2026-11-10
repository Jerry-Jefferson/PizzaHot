var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Check, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, } from "typeorm";
import { DiscountMode } from "../../libs/contracts/index.js";
import { checkIn, checkName } from "../../libs/database/check-in.util.js";
let Promocode = class Promocode {
    id;
    code;
    discount;
    validTill;
    discountMode;
    createdAt;
    updatedAt;
    deletedAt;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Promocode.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", unique: true }),
    __metadata("design:type", String)
], Promocode.prototype, "code", void 0);
__decorate([
    Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        },
    }),
    __metadata("design:type", Number)
], Promocode.prototype, "discount", void 0);
__decorate([
    Column({ type: "timestamp" }),
    __metadata("design:type", Date)
], Promocode.prototype, "validTill", void 0);
__decorate([
    Column({ type: "varchar", length: 32 }),
    __metadata("design:type", String)
], Promocode.prototype, "discountMode", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Promocode.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Promocode.prototype, "updatedAt", void 0);
__decorate([
    DeleteDateColumn(),
    __metadata("design:type", Date)
], Promocode.prototype, "deletedAt", void 0);
Promocode = __decorate([
    Entity("promocodes"),
    Check(checkName("promocodes", "discountMode"), checkIn("discountMode", Object.values(DiscountMode)))
], Promocode);
export { Promocode };
//# sourceMappingURL=promocode.entity.js.map