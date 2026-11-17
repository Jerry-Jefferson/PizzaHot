import { Gender } from "@/types/user.types";

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: "Male",
  [Gender.FEMALE]: "Female",
};

export const GENDERS = Object.values(Gender);
