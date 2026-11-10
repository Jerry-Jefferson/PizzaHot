import { Gender } from "../constants/gender.constant.ts";
export declare class CreateUserDto {
    email: string;
    password: string;
    name?: string;
    surname?: string;
    gender?: Gender;
    isEmailVerified: boolean;
    verificationToken?: string | null;
    verificationTokenExpiresAt?: Date | null;
}
