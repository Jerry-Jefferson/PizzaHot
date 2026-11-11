import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";

import BaseFormField from "@/components/base/BaseFormField.vue";

function setup(props: { hint?: string; error?: string; required?: boolean } = {}) {
  return mount(BaseFormField, {
    props: { inputId: "email", label: "Email", ...props },
    slots: {
      default: (scope: { id: string; invalid: boolean; describedBy?: string }) =>
        h("input", {
          id: scope.id,
          "aria-describedby": scope.describedBy,
          "data-invalid": String(scope.invalid),
        }),
    },
  });
}

describe("BaseFormField", () => {
  it("links the label to the input", () => {
    const wrapper = setup();

    expect(wrapper.get("label").attributes("for")).toBe("email");
    expect(wrapper.get("input").attributes("id")).toBe("email");
  });

  it("shows the hint and describes the input with it", () => {
    const wrapper = setup({ hint: "We never share it" });

    expect(wrapper.get("#email-message").text()).toBe("We never share it");
    expect(wrapper.get("input").attributes("aria-describedby")).toBe("email-message");
    expect(wrapper.get("input").attributes("data-invalid")).toBe("false");
  });

  it("shows the error instead of the hint and marks the input invalid", () => {
    const wrapper = setup({ hint: "We never share it", error: "Please enter a valid email" });

    expect(wrapper.get("[role='alert']").text()).toBe("Please enter a valid email");
    expect(wrapper.text()).not.toContain("We never share it");
    expect(wrapper.get("input").attributes("data-invalid")).toBe("true");
  });

  it("has no description without hint or error", () => {
    expect(setup().get("input").attributes("aria-describedby")).toBeUndefined();
  });

  it("marks a required field", () => {
    expect(setup({ required: true }).get("label").text()).toBe("Email *");
  });
});
