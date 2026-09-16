import { ApiPropertyOptional } from "@nestjs/swagger";
import { Gender } from "../constants/gender.enum.ts";

export class UpdateUserDto {
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
}
