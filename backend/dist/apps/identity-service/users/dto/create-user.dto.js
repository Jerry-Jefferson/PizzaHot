var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Gender } from "../constants/gender.constant.js";
export class CreateUserDto {
    email;
    password;
    name;
    surname;
    gender;
    isEmailVerified;
    verificationToken;
    verificationTokenExpiresAt;
}
__decorate([
    ApiProperty({ example: "john@example.com", maxLength: 255 }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: "P@ssword1", minLength: 8, maxLength: 128 }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    ApiPropertyOptional({ example: "John", minLength: 1, maxLength: 100 }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional({ example: "Doe", minLength: 1, maxLength: 100 }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "surname", void 0);
__decorate([
    ApiPropertyOptional({ enum: Gender, example: Gender.MALE }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "gender", void 0);
__decorate([
    ApiProperty({ example: false, default: false }),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "isEmailVerified", void 0);
__decorate([
    ApiPropertyOptional(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "verificationToken", void 0);
__decorate([
    ApiPropertyOptional(),
    __metadata("design:type", Date)
], CreateUserDto.prototype, "verificationTokenExpiresAt", void 0);
//# sourceMappingURL=create-user.dto.js.map