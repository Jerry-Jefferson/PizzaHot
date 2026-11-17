import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";

import BaseInput from "@/components/base/BaseInput.vue";

type Props = InstanceType<typeof BaseInput>["$props"];

const setup = (props: Props = {}, slots: Record<string, string> = {}) =>
  mount(BaseInput, {
    props: { id: "field", modelValue: "secret", ...props },
    slots,
    global: { plugins: [PrimeVue] },
  });

describe("BaseInput", () => {
  it("renders a text input with the given icon and no toggle", () => {
    const wrapper = setup({ icon: "pi pi-search" });

    expect(wrapper.get("input").attributes("type")).toBe("text");
    expect(wrapper.find(".pi-search").exists()).toBe(true);
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("uses the type prop", () => {
    expect(setup({ type: "email" }).get("input").attributes("type")).toBe("email");
  });

  it("renders the trailing slot", () => {
    const wrapper = setup({}, { trailing: "<span data-test='trailing'>%</span>" });

    expect(wrapper.find("[data-test='trailing']").exists()).toBe(true);
  });

  it("emits typed values", async () => {
    const wrapper = setup();

    await wrapper.get("input").setValue("new-value");

    expect(wrapper.emitted("update:modelValue")).toContainEqual(["new-value"]);
  });

  describe("with isPassword", () => {
    it("hides the value behind a lock icon by default", () => {
      const wrapper = setup({ isPassword: true, type: "email" });

      expect(wrapper.get("input").attributes("type")).toBe("password");
      expect(wrapper.find(".pi-lock").exists()).toBe(true);
      expect(wrapper.get("button").attributes("aria-label")).toBe("Show password");
      expect(wrapper.get("button").attributes("aria-pressed")).toBe("false");
    });

    it("keeps an explicit icon", () => {
      const wrapper = setup({ isPassword: true, icon: "pi pi-key" });

      expect(wrapper.find(".pi-key").exists()).toBe(true);
      expect(wrapper.find(".pi-lock").exists()).toBe(false);
    });

    it("toggles visibility with the eye button", async () => {
      const wrapper = setup({ isPassword: true });

      await wrapper.get("button").trigger("click");

      expect(wrapper.get("input").attributes("type")).toBe("text");
      expect(wrapper.get("button").attributes("aria-label")).toBe("Hide password");
      expect(wrapper.get("button").attributes("aria-pressed")).toBe("true");
      expect(wrapper.find(".pi-eye-slash").exists()).toBe(true);
    });

    it("disables the toggle with the input", () => {
      const wrapper = setup({ isPassword: true, disabled: true });

      expect(wrapper.get("button").attributes("disabled")).toBeDefined();
    });

    it("shows the toggle instead of the trailing slot", () => {
      const wrapper = setup(
        { isPassword: true },
        { trailing: "<span data-test='trailing'>%</span>" }
      );

      expect(wrapper.find("[data-test='trailing']").exists()).toBe(false);
      expect(wrapper.find("button").exists()).toBe(true);
    });
  });
});
