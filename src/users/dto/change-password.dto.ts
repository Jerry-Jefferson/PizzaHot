import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto {
  @ApiProperty({
    example: "OldP@ssw0rd",
    description: "The user's current password",
    minLength: 8,
    maxLength: 128,
  })
  currentPassword: string;

  @ApiProperty({
    example: "NewP@ssw0rd",
    description: "The new password to set",
    minLength: 8,
    maxLength: 128,
  })
  newPassword: string;
}
