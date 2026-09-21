import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Gender } from "../constants/gender.constant.ts";

export class CreateUserDto {
  @ApiProperty({ example: "john@example.com", maxLength: 255 })
  email: string;

  @ApiProperty({ example: "P@ssword1", minLength: 8, maxLength: 128 })
  password: string;

  @ApiPropertyOptional({ example: "John", minLength: 1, maxLength: 100 })
  name?: string;

  @ApiPropertyOptional({ example: "Doe", minLength: 1, maxLength: 100 })
  surname?: string;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  gender?: Gender;

  @ApiPropertyOptional({
    example: "https://example.com/avatar.jpg",
    description: "URL of the user's profile image",
  })
  image?: string;

  @ApiProperty({ example: false, default: false })
  isEmailVerified: boolean;

  @ApiPropertyOptional()
  verificationToken?: string | null;

  @ApiPropertyOptional()
  verificationTokenExpiresAt?: Date | null;
}
