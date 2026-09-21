import { ApiProperty } from "@nestjs/swagger";
import { Role, ROLES } from "../../../../libs/auth/auth.constant.ts";

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: ROLES,
    example: Role.ADMIN,
    description: "The role to give this user",
  })
  role: Role;
}
