import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";

import SignInForm from "@/components/auth/SignInForm.vue";
import type { SignInErrors } from "@/types/auth.types";

function setup(
  props: { errors?: SignInErrors; formError?: string | null; loading?: boolean } = {}
) {
  return mount(SignInForm, {
    props: { email: "", password: "", ...props },
    global: { plugins: [PrimeVue] },
  });
}

describe("SignInForm", () => {
  it("renders labelled email and password inputs", () => {
    const wrapper = setup();

    expect(wrapper.get("label[for='sign-in-email']").text()).toBe("Email");
    expect(wrapper.get("#sign-in-email").attributes("type")).toBe("email");
    expect(wrapper.get("label[for='sign-in-password']").text()).toBe("Password");
    expect(wrapper.get("#sign-in-password").attributes("type")).toBe("password");
  });

  it("emits v-model updates", async () => {
    const wrapper = setup();

    await wrapper.get("#sign-in-email").setValue("mario@x.io");
    await wrapper.get("#sign-in-password").setValue("Secret1!");

    expect(wrapper.emitted("update:email")).toContainEqual(["mario@x.io"]);
    expect(wrapper.emitted("update:password")).toContainEqual(["Secret1!"]);
  });

  it("emits blur with the field name", async () => {
    const wrapper = setup();

    await wrapper.get("#sign-in-email").trigger("blur");
    await wrapper.get("#sign-in-password").trigger("blur");

    expect(wrapper.emitted("blur")).toEqual([["email"], ["password"]]);
  });

  it("emits submit", async () => {
    const wrapper = setup();

    await wrapper.get("form").trigger("submit");

    expect(wrapper.emitted("submit")).toHaveLength(1);
  });

  it("shows field errors linked to their inputs", () => {
    const wrapper = setup({ errors: { email: "Email is required" } });

    const input = wrapper.get("#sign-in-email");
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("aria-describedby")).toBe("sign-in-email-message");
    expect(wrapper.get("#sign-in-email-message").text()).toBe("Email is required");
  });

  it("shows the form alert only when set", () => {
    expect(setup().find("[data-test='form-error']").exists()).toBe(false);

    const alert = setup({ formError: "Invalid email or password" }).get("[data-test='form-error']");
    expect(alert.attributes("role")).toBe("alert");
    expect(alert.text()).toBe("Invalid email or password");
  });

  it("disables the submit button while loading", () => {
    expect(setup({ loading: true }).get("button[type='submit']").attributes()).toHaveProperty(
      "disabled"
    );
  });
});
