import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import AdminProfileHeader from "@/components/admin/AdminProfileHeader.vue";
import type { UserSummary } from "@/types/user.types";

const admin = (overrides: Partial<UserSummary> = {}): UserSummary => ({
  name: "Sofia",
  surname: "Bianchi",
  email: "admin@pizzahot.io",
  image: null,
  ...overrides,
});

describe("AdminProfileHeader", () => {
  it("shows the name, email and Administrator badge on the subtle panel", () => {
    const wrapper = mount(AdminProfileHeader, { props: { user: admin() } });

    expect(wrapper.classes()).toContain("bg-card-subtle");
    expect(wrapper.get("[data-test='admin-name']").text()).toBe("Sofia Bianchi");
    expect(wrapper.get("[data-test='admin-email']").text()).toBe("admin@pizzahot.io");
    const badge = wrapper.get("[data-test='admin-badge']");
    expect(badge.text()).toBe("Administrator");
    expect(badge.classes()).toEqual(expect.arrayContaining(["bg-primary/10", "text-primary"]));
  });

  it("falls back to the email when the admin has no name", () => {
    const wrapper = mount(AdminProfileHeader, {
      props: { user: admin({ name: null, surname: null }) },
    });

    expect(wrapper.get("[data-test='admin-name']").text()).toBe("admin@pizzahot.io");
  });
});
