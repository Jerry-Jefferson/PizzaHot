import { UserResponseDto } from "../../users/dto/user-response.dto.ts";
export declare class AuthResponseDto {
    accessToken: string;
    user: UserResponseDto;
    constructor(accessToken: string, user: UserResponseDto);
}
