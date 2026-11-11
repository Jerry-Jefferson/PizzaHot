import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import AdminTopbar from "@/components/layout/AdminTopbar.vue";
import { routes } from "@/router/routes";

function setup(pendingCount: number) {
  const router = createRouter({ history: createMemoryHistory(), routes });
  return mount(AdminTopbar, {
    props: { title: "Orders", pendingCount },
    global: { plugins: [router] },
  });
}

describe("AdminTopbar", () => {
  it("shows the page title", () => {
    expect(setup(0).get("h1").text()).toBe("Orders");
  });

  it("hides the pending pill at zero", () => {
    expect(setup(0).find("[data-test='pending-pill']").exists()).toBe(false);
  });

  it("links the pending pill to orders filtered by pending", () => {
    const pill = setup(3).get("[data-test='pending-pill']");

    expect(pill.text()).toBe("3 pending");
    expect(pill.attributes("href")).toBe("/admin/orders?status=pending");
  });

  it("emits openMenu from the mobile menu button", async () => {
    const wrapper = setup(0);

    await wrapper.get("[aria-label='Open navigation']").trigger("click");

    expect(wrapper.emitted("openMenu")).toHaveLength(1);
  });
});
