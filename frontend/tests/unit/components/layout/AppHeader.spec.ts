import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import AppHeader from "@/components/layout/AppHeader.vue";
import { routes } from "@/router/routes";
import type { UserSummary } from "@/types/user.types";

const USER: UserSummary = { name: "Mario", surname: "Rossi", email: "mario@x.io", image: null };

function setup(props: {
  user?: UserSummary | null;
  cartCount?: number;
  currentRouteName?: string;
}) {
  const router = createRouter({ history: createMemoryHistory(), routes });
  return mount(AppHeader, {
    props: { user: null, cartCount: 0, ...props },
    global: { plugins: [PrimeVue, router] },
  });
}

const desktopNav = (wrapper: ReturnType<typeof setup>) =>
  wrapper.get("header > div nav[aria-label='Main']");

describe("AppHeader", () => {
  it.each([
    ["menu", "Menu"],
    ["pizza-details", "Menu"],
    ["my-order-details", "Orders"],
    ["profile", "Profile"],
  ])("highlights the nav item for %s", (currentRouteName, label) => {
    const active = desktopNav(setup({ currentRouteName })).get("[aria-current='page']");

    expect(active.text()).toBe(label);
    expect(active.classes()).toEqual(expect.arrayContaining(["bg-primary/10", "text-primary"]));
  });

  it("highlights nothing on an unrelated route", () => {
    expect(
      desktopNav(setup({ currentRouteName: "cart" }))
        .find("[aria-current]")
        .exists()
    ).toBe(false);
  });

  describe("cart button", () => {
    it("is a ghost button without a bubble when empty", () => {
      const cart = setup({ cartCount: 0, currentRouteName: "menu" }).get(
        "[data-test='cart-button']"
      );

      expect(cart.attributes("data-highlighted")).toBe("false");
      expect(cart.find("[data-test='cart-count']").exists()).toBe(false);
    });

    it("is filled with a light bubble when it has items", () => {
      const cart = setup({ cartCount: 3 }).get("[data-test='cart-button']");

      expect(cart.attributes("data-highlighted")).toBe("true");
      expect(cart.classes()).toContain("bg-primary");
      expect(cart.get("[data-test='cart-count']").text()).toBe("3");
      expect(cart.get("[data-test='cart-count']").classes()).toContain("bg-primary-foreground/20");
    });

    it.each(["cart", "checkout"])(
      "is filled on the %s route even when empty",
      (currentRouteName) => {
        const cart = setup({ cartCount: 0, currentRouteName }).get("[data-test='cart-button']");

        expect(cart.attributes("data-highlighted")).toBe("true");
        expect(cart.find("[data-test='cart-count']").exists()).toBe(false);
      }
    );

    it("announces the item count", () => {
      expect(
        setup({ cartCount: 2 }).get("[data-test='cart-button']").attributes("aria-label")
      ).toBe("Cart, 2 items");
    });
  });

  it("shows a sign-in link for guests", () => {
    const wrapper = setup({ user: null });

    expect(wrapper.find("[aria-label='Sign out']").exists()).toBe(false);
    expect(wrapper.text()).toContain("Sign in");
  });

  it("shows the avatar initials and emits signOut for a signed-in user", async () => {
    const wrapper = setup({ user: USER });

    expect(wrapper.text()).toContain("MR");
    await wrapper.get("[aria-label='Sign out']").trigger("click");

    expect(wrapper.emitted("signOut")).toHaveLength(1);
  });
});
