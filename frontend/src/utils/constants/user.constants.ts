import type { StatusTone } from "@/types/ui.types";
import { Gender, Role } from "@/types/user.types";

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: "Male",
  [Gender.FEMALE]: "Female",
};

export const GENDERS = Object.values(Gender);

export const DELETED_USER_LABEL = "Deleted user";

export const UNKNOWN_USER_LABEL = "Unknown customer";

export const USER_DETAILS_STALE_MS = 5 * 60_000;

export const ADMIN_USERS_PAGE_SIZE = 10;

export const ROLE_META: Record<Role, { label: string; tone: StatusTone }> = {
  [Role.ADMIN]: { label: "Admin", tone: "primary" },
  [Role.USER]: { label: "Customer", tone: "neutral" },
};
