import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import AdminPageHeader from "@/components/admin/AdminPageHeader.vue";

describe("AdminPageHeader", () => {
  it("shows the title and subtitle", () => {
    const wrapper = mount(AdminPageHeader, {
      props: { title: "Pizza Management", subtitle: "12 pizzas on the menu" },
    });

    expect(wrapper.get("h2").text()).toBe("Pizza Management");
    expect(wrapper.get("[data-test='page-subtitle']").text()).toBe("12 pizzas on the menu");
  });

  it("omits the subtitle when there is none", () => {
    const wrapper = mount(AdminPageHeader, { props: { title: "Orders" } });

    expect(wrapper.find("[data-test='page-subtitle']").exists()).toBe(false);
  });

  it("renders the actions slot", () => {
    const wrapper = mount(AdminPageHeader, {
      props: { title: "Pizza Management" },
      slots: { actions: "<button>+ Add Pizza</button>" },
    });

    expect(wrapper.get("button").text()).toBe("+ Add Pizza");
  });
});
