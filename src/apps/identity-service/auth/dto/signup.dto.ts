import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Gender } from "../../users/constants/gender.constant.ts";

export class SignupDto {
  @ApiProperty({ example: "john@example.com" })
  email: string;

  @ApiProperty({ example: "P@ssword123!", minLength: 10 })
  password: string;

  @ApiProperty({ example: "P@ssword123!" })
  confirmPassword: string;

  @ApiPropertyOptional({ example: "John" })
  name?: string;

  @ApiPropertyOptional({ example: "Doe" })
  surname?: string;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  gender?: Gender;

  @ApiPropertyOptional({
    example: "https://example.com/avatar.jpg",
    description: "URL of the user's profile image",
  })
  image?: string;
}
