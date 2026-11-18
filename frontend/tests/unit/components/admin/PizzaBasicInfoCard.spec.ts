import { mount, type VueWrapper } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it, vi } from "vitest";

import PizzaBasicInfoCard from "@/components/admin/PizzaBasicInfoCard.vue";
import type { PizzaFormErrors } from "@/types/pizza.types";

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
);

function setup(errors: PizzaFormErrors = {}, price: number | null = 13.9) {
  const wrapper: VueWrapper = mount(PizzaBasicInfoCard, {
    props: {
      name: "Margherita",
      description: "Classic",
      price,
      errors,
      "onUpdate:name": (name: string) => wrapper.setProps({ name }),
    },
    global: { plugins: [PrimeVue] },
  });
  return wrapper;
}

describe("PizzaBasicInfoCard", () => {
  it("shows the values, with the price to two decimals", () => {
    const wrapper = setup();

    expect(wrapper.get<HTMLInputElement>("#pizza-name").element.value).toBe("Margherita");
    expect(wrapper.get<HTMLTextAreaElement>("#pizza-description").element.value).toBe("Classic");
    expect(wrapper.get<HTMLInputElement>("#pizza-price").element.value).toBe("$13.90");
  });

  it("updates the name and reports blur", async () => {
    const wrapper = setup();

    await wrapper.get("#pizza-name").setValue("Diavola");
    await wrapper.get("#pizza-name").trigger("blur");

    expect(wrapper.emitted("update:name")?.[0]).toEqual(["Diavola"]);
    expect(wrapper.emitted("blur")?.[0]).toEqual(["name"]);
  });

  it("shows the field errors", () => {
    const wrapper = setup({
      name: "Name cannot be empty",
      price: "Price must be greater than 0",
    });

    expect(wrapper.text()).toContain("Name cannot be empty");
    expect(wrapper.text()).toContain("Price must be greater than 0");
    expect(wrapper.get("#pizza-name").attributes("aria-invalid")).toBe("true");
  });
});
