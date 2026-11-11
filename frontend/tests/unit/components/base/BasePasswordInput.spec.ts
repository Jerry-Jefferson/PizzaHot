import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";

import BasePasswordInput from "@/components/base/BasePasswordInput.vue";

const setup = () =>
  mount(BasePasswordInput, {
    props: { id: "password", modelValue: "secret" },
    global: { plugins: [PrimeVue] },
  });

describe("BasePasswordInput", () => {
  it("hides the password by default", () => {
    const wrapper = setup();

    expect(wrapper.get("input").attributes("type")).toBe("password");
    expect(wrapper.get("button").attributes("aria-label")).toBe("Show password");
  });

  it("toggles visibility with the eye button", async () => {
    const wrapper = setup();

    await wrapper.get("button").trigger("click");

    expect(wrapper.get("input").attributes("type")).toBe("text");
    expect(wrapper.get("button").attributes("aria-label")).toBe("Hide password");
  });

  it("emits typed values", async () => {
    const wrapper = setup();

    await wrapper.get("input").setValue("new-secret");

    expect(wrapper.emitted("update:modelValue")).toContainEqual(["new-secret"]);
  });
});
