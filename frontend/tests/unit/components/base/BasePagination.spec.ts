import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import BasePagination from "@/components/base/BasePagination.vue";

function setup(page: number, totalPages: number) {
  const wrapper = mount(BasePagination, {
    props: {
      page,
      totalPages,
      "onUpdate:page": (value: number) => wrapper.setProps({ page: value }),
    },
  });
  return wrapper;
}

describe("BasePagination", () => {
  it("renders nothing for a single page", () => {
    expect(setup(1, 1).find("nav").exists()).toBe(false);
  });

  it("marks the current page", () => {
    const current = setup(2, 5).get("[aria-current='page']");

    expect(current.text()).toBe("2");
    expect(current.classes()).toContain("bg-primary");
  });

  it("emits update:page for a numbered, previous and next click", async () => {
    const wrapper = setup(2, 5);

    await wrapper.get("[aria-label='Page 4']").trigger("click");
    await wrapper.get("[aria-label='Previous page']").trigger("click");
    await wrapper.get("[aria-label='Next page']").trigger("click");

    expect(wrapper.emitted("update:page")).toEqual([[4], [3], [4]]);
    expect(wrapper.get("[aria-current='page']").text()).toBe("4");
  });

  it("does not emit for the current page", async () => {
    const wrapper = setup(2, 5);

    await wrapper.get("[aria-label='Page 2']").trigger("click");

    expect(wrapper.emitted("update:page")).toBeUndefined();
  });

  it("disables previous on the first page and next on the last", () => {
    expect(setup(1, 5).get("[aria-label='Previous page']").attributes()).toHaveProperty("disabled");
    expect(setup(5, 5).get("[aria-label='Next page']").attributes()).toHaveProperty("disabled");
  });
});
