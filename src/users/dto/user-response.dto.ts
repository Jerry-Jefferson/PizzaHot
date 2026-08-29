import { ApiProperty } from "@nestjs/swagger";
import { Gender } from "../constants/gender.enum.ts";
import { Role } from "../constants/role.enum.ts";
import { User } from "../entities/user.entity.ts";

export class UserResponseDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000", format: "uuid" })
  id: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty({ example: "john@example.com" })
  email: string;

  @ApiProperty({ example: "John" })
  name: string;

  @ApiProperty({ example: "Doe" })
  surname: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  gender: Gender;

  @ApiProperty({ example: "https://example.com/avatar.jpg" })
  image: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.role = user.role;
    dto.email = user.email;
    dto.name = user.name;
    dto.surname = user.surname;
    dto.gender = user.gender;
    dto.image = user.image;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
