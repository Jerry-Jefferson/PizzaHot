import { Gender } from "../../users/constants/gender.constant.ts";
export declare class SignupDto {
    email: string;
    password: string;
    confirmPassword: string;
    name?: string;
    surname?: string;
    gender?: Gender;
}
