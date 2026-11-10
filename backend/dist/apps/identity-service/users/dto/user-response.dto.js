var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from "@nestjs/swagger";
import { Gender } from "../constants/gender.constant.js";
import { Role } from "../../../../libs/auth/auth.constant.js";
export class UserResponseDto {
    id;
    role;
    email;
    name;
    surname;
    gender;
    image;
    isEmailVerified;
    createdAt;
    updatedAt;
    static fromEntity(user) {
        const dto = new UserResponseDto();
        dto.id = user.id;
        dto.role = user.role;
        dto.email = user.email;
        dto.name = user.name;
        dto.surname = user.surname;
        dto.gender = user.gender;
        dto.image = user.image;
        dto.isEmailVerified = user.isEmailVerified;
        dto.createdAt = user.createdAt;
        dto.updatedAt = user.updatedAt;
        return dto;
    }
    static fromEntities(users) {
        return users.map((user) => UserResponseDto.fromEntity(user));
    }
}
__decorate([
    ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000", format: "uuid" }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    ApiProperty({ enum: Role, example: Role.USER }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "role", void 0);
__decorate([
    ApiProperty({ example: "john@example.com" }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: "John", nullable: true }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "name", void 0);
__decorate([
    ApiProperty({ example: "Doe", nullable: true }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "surname", void 0);
__decorate([
    ApiProperty({ enum: Gender, example: Gender.MALE, nullable: true }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "gender", void 0);
__decorate([
    ApiProperty({ example: "https://example.com/avatar.jpg", nullable: true }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "image", void 0);
__decorate([
    ApiProperty({ example: true }),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "isEmailVerified", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "createdAt", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=user-response.dto.js.map