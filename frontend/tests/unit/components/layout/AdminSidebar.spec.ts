import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import AdminSidebar from "@/components/layout/AdminSidebar.vue";
import { routes } from "@/router/routes";
import type { UserSummary } from "@/types/user.types";

const ADMIN: UserSummary = { name: "Ada", surname: "Admin", email: "ada@x.io", image: null };

function setup(props: {
  pendingCount?: number;
  currentRouteName?: string;
  user?: UserSummary | null;
}) {
  const router = createRouter({ history: createMemoryHistory(), routes });
  return mount(AdminSidebar, {
    props: { user: ADMIN, pendingCount: 0, ...props },
    global: { plugins: [router] },
  });
}

describe("AdminSidebar", () => {
  it("groups items under Management and Account", () => {
    const text = setup({}).text();

    expect(text).toContain("Management");
    expect(text).toContain("Account");
  });

  it.each([
    ["admin-dashboard", "Dashboard"],
    ["admin-pizza-new", "Pizzas"],
    ["admin-pizza-edit", "Pizzas"],
    ["admin-promocodes", "Promo codes"],
    ["admin-profile", "Profile"],
  ])("marks the item for %s as active", (currentRouteName, label) => {
    const active = setup({ currentRouteName }).get("[aria-current='page']");

    expect(active.text()).toContain(label);
    expect(active.classes()).toEqual(
      expect.arrayContaining(["bg-primary", "text-primary-foreground"])
    );
  });

  it("shows the pending count on Orders only when above zero", () => {
    expect(setup({ pendingCount: 0 }).find("[data-test='pending-count']").exists()).toBe(false);

    const badge = setup({ pendingCount: 4 }).get("[data-test='pending-count']");
    expect(badge.text()).toBe("4");
    expect(badge.element.closest("a")?.textContent).toContain("Orders");
  });

  it("emits navigate when an item is clicked", async () => {
    const wrapper = setup({});

    await wrapper.get("a[href='/admin/users']").trigger("click");

    expect(wrapper.emitted("navigate")).toHaveLength(1);
  });

  it("shows the admin and emits signOut", async () => {
    const wrapper = setup({});

    expect(wrapper.text()).toContain("Ada Admin");
    expect(wrapper.text()).toContain("ada@x.io");
    const signOut = wrapper.findAll("button").find((button) => button.text() === "Sign out");
    await signOut?.trigger("click");

    expect(wrapper.emitted("signOut")).toHaveLength(1);
  });
});
