import { describe, expect, it } from "vitest";

import type { User } from "@/types/user.types";
import { DELETED_USER_LABEL, UNKNOWN_USER_LABEL } from "@/utils/constants/user.constants";
import { getCustomerLabel, getUserDisplayName } from "@/utils/user";

const user = (overrides: Partial<User> = {}): User =>
  ({ id: "u1", email: "mario@x.io", name: "Mario", surname: "Rossi", ...overrides }) as User;

describe("getUserDisplayName", () => {
  it.each([
    ["the full name", { name: "Mario", surname: "Rossi" }, "Mario Rossi"],
    ["the first name only", { name: "Mario", surname: null }, "Mario"],
    ["trimmed parts", { name: "  Mario ", surname: " Rossi  " }, "Mario Rossi"],
    ["the email without a name", { name: null, surname: "  " }, "mario@x.io"],
  ])("uses %s", (_label, overrides, expected) => {
    expect(getUserDisplayName(user(overrides))).toBe(expected);
  });
});

describe("getCustomerLabel", () => {
  it("labels an order without a user as a deleted user", () => {
    expect(getCustomerLabel(null, undefined)).toBe(DELETED_USER_LABEL);
  });

  it("labels a user that failed to load as unknown", () => {
    expect(getCustomerLabel("u1", null)).toBe(UNKNOWN_USER_LABEL);
  });

  it("returns undefined while the user is still loading", () => {
    expect(getCustomerLabel("u1", undefined)).toBeUndefined();
  });

  it("uses the display name of a loaded user", () => {
    expect(getCustomerLabel("u1", user())).toBe("Mario Rossi");
  });
});
