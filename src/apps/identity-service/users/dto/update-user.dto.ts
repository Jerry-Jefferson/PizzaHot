import { ApiPropertyOptional } from "@nestjs/swagger";
import { Gender } from "../constants/gender.constant.ts";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "John", minLength: 1, maxLength: 100 })
  name?: string;

  @ApiPropertyOptional({ example: "Doe", minLength: 1, maxLength: 100 })
  surname?: string;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  gender?: Gender;
}
