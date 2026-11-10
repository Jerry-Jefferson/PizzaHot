import { Gender } from "../constants/gender.constant.ts";
import { Role } from "../../../../libs/auth/auth.constant.ts";
import { User } from "../user.entity.ts";
export declare class UserResponseDto {
    id: string;
    role: Role;
    email: string;
    name: string | null;
    surname: string | null;
    gender: Gender | null;
    image: string | null;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(user: User): UserResponseDto;
    static fromEntities(users: User[]): UserResponseDto[];
}
