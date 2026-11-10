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
export class UpdateUserDto {
    name;
    surname;
    gender;
}
__decorate([
    ApiProperty({ example: "John", minLength: 1, maxLength: 100, nullable: true, default: null }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "name", void 0);
__decorate([
    ApiProperty({ example: "Doe", minLength: 1, maxLength: 100, nullable: true, default: null }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "surname", void 0);
__decorate([
    ApiProperty({ enum: Gender, example: Gender.MALE, nullable: true, default: null }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "gender", void 0);
//# sourceMappingURL=update-user.dto.js.map