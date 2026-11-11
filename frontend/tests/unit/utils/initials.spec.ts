import { describe, expect, it } from "vitest";

import { getInitials } from "@/utils/initials";

describe("getInitials", () => {
  it.each([
    [{ name: "mario", surname: "rossi", email: "m@x.io" }, "MR"],
    [{ name: "Luigi", surname: null, email: "l@x.io" }, "L"],
    [{ name: null, surname: "Verdi" }, "V"],
    [{ name: "  ", surname: "", email: "anna@x.io" }, "A"],
    [{}, "?"],
  ])("returns %j → %s", (source, expected) => {
    expect(getInitials(source)).toBe(expected);
  });
});
