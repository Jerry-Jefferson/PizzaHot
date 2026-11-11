import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { routes } from "@/router/routes";
import NotFoundView from "@/views/NotFoundView.vue";

describe("NotFoundView", () => {
  it("explains the page is missing and links back to the menu", () => {
    const router = createRouter({ history: createMemoryHistory(), routes });
    const wrapper = mount(NotFoundView, { global: { plugins: [router] } });

    expect(wrapper.text()).toContain("Page not found");
    const link = wrapper.get("a");
    expect(link.text()).toBe("Back to menu");
    expect(link.attributes("href")).toBe("/");
  });
});
