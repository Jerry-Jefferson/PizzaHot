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
import { Gender } from "../../users/constants/gender.constant.js";
export class SignupDto {
    email;
    password;
    confirmPassword;
    name;
    surname;
    gender;
}
__decorate([
    ApiProperty({ example: "john@example.com" }),
    __metadata("design:type", String)
], SignupDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: "P@ssword123!!", minLength: 10 }),
    __metadata("design:type", String)
], SignupDto.prototype, "password", void 0);
__decorate([
    ApiProperty({ example: "P@ssword123!!" }),
    __metadata("design:type", String)
], SignupDto.prototype, "confirmPassword", void 0);
__decorate([
    ApiPropertyOptional({ example: "John" }),
    __metadata("design:type", String)
], SignupDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional({ example: "Doe" }),
    __metadata("design:type", String)
], SignupDto.prototype, "surname", void 0);
__decorate([
    ApiPropertyOptional({ enum: Gender, example: Gender.MALE }),
    __metadata("design:type", String)
], SignupDto.prototype, "gender", void 0);
//# sourceMappingURL=signup.dto.js.map