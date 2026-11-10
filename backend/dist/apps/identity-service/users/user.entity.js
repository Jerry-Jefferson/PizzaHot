var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Check, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, } from "typeorm";
import { Gender } from "./constants/gender.constant.js";
import { Role } from "../../../libs/auth/auth.constant.js";
import { checkIn, checkName } from "../../../libs/database/check-in.util.js";
let User = class User {
    id;
    role;
    email;
    passwordHash;
    isEmailVerified;
    verificationToken;
    verificationTokenExpiresAt;
    name;
    surname;
    gender;
    image;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", length: 32, default: Role.USER }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    Column({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isEmailVerified", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "verificationToken", void 0);
__decorate([
    Column({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "verificationTokenExpiresAt", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "surname", void 0);
__decorate([
    Column({ type: "varchar", length: 32, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "gender", void 0);
__decorate([
    Column({ type: "varchar", nullable: true, default: null }),
    __metadata("design:type", String)
], User.prototype, "image", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
User = __decorate([
    Entity("users"),
    Check(checkName("users", "role"), checkIn("role", Object.values(Role))),
    Check(checkName("users", "gender"), checkIn("gender", Object.values(Gender)))
], User);
export { User };
//# sourceMappingURL=user.entity.js.map