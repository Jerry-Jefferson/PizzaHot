import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import BaseQuantityStepper from "@/components/base/BaseQuantityStepper.vue";

function setup(modelValue: number, props: Record<string, unknown> = {}) {
  const wrapper = mount(BaseQuantityStepper, {
    props: {
      modelValue,
      "onUpdate:modelValue": (value: number) => wrapper.setProps({ modelValue: value }),
      ...props,
    },
  });
  return {
    wrapper,
    decrease: () => wrapper.get("[aria-label='Decrease quantity']"),
    increase: () => wrapper.get("[aria-label='Increase quantity']"),
  };
}

describe("BaseQuantityStepper", () => {
  it("shows the current value", () => {
    expect(setup(3).wrapper.get("output").text()).toBe("3");
  });

  it("emits the next value on increase and decrease", async () => {
    const { wrapper, increase, decrease } = setup(3);

    await increase().trigger("click");
    await decrease().trigger("click");
    await decrease().trigger("click");

    expect(wrapper.emitted("update:modelValue")).toEqual([[4], [3], [2]]);
    expect(wrapper.get("output").text()).toBe("2");
  });

  it("disables decrease at the default minimum of 1", async () => {
    const { wrapper, decrease } = setup(1);

    expect(decrease().attributes()).toHaveProperty("disabled");
    await decrease().trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("disables increase at the default maximum of 50", () => {
    const { increase, decrease } = setup(50);

    expect(increase().attributes()).toHaveProperty("disabled");
    expect(decrease().attributes()).not.toHaveProperty("disabled");
  });

  it("respects custom bounds", () => {
    const { increase, decrease } = setup(0, { min: 0, max: 0 });

    expect(increase().attributes()).toHaveProperty("disabled");
    expect(decrease().attributes()).toHaveProperty("disabled");
  });

  it("disables both buttons when disabled", () => {
    const { increase, decrease } = setup(5, { disabled: true });

    expect(increase().attributes()).toHaveProperty("disabled");
    expect(decrease().attributes()).toHaveProperty("disabled");
  });
});
