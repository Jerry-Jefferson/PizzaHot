import type { User } from "@/types/user.types";
import { DELETED_USER_LABEL, UNKNOWN_USER_LABEL } from "@/utils/constants/user.constants";

export function getUserDisplayName(user: Pick<User, "name" | "surname" | "email">): string {
  const fullName = [user.name, user.surname]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  return fullName || user.email;
}

export function getCustomerLabel(
  userId: string | null,
  customer: User | null | undefined
): string | undefined {
  if (userId === null) {
    return DELETED_USER_LABEL;
  }
  if (customer === null) {
    return UNKNOWN_USER_LABEL;
  }
  return customer ? getUserDisplayName(customer) : undefined;
}
