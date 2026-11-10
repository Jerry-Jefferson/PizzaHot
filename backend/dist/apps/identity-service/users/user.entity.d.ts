import { Gender } from "./constants/gender.constant.ts";
import { Role } from "../../../libs/auth/auth.constant.ts";
export declare class User {
    id: string;
    role: Role;
    email: string;
    passwordHash: string;
    isEmailVerified: boolean;
    verificationToken: string | null;
    verificationTokenExpiresAt: Date | null;
    name: string | null;
    surname: string | null;
    gender: Gender | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
}
