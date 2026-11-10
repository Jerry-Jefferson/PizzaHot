import { ApiProperty } from "@nestjs/swagger";
import { Gender } from "../constants/gender.constant.ts";

export class UpdateUserDto {
  @ApiProperty({ example: "John", minLength: 1, maxLength: 100, nullable: true, default: null })
  name: string | null;

  @ApiProperty({ example: "Doe", minLength: 1, maxLength: 100, nullable: true, default: null })
  surname: string | null;

  @ApiProperty({ enum: Gender, example: Gender.MALE, nullable: true, default: null })
  gender: Gender | null;
}
