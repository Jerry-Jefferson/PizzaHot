import { mount } from "@vue/test-utils";
import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from "axios";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";

import { EMAIL_TAKEN_MESSAGE, useSignUpForm } from "@/composables/useSignUpForm";
import type { SignUpFormValues } from "@/types/auth.types";

const VALID: SignUpFormValues = {
  name: "Mario",
  surname: "Rossi",
  email: "mario@x.io",
  password: "Secret1!",
  confirmPassword: "Secret1!",
};

function setup(values: Partial<SignUpFormValues> = {}) {
  let result!: ReturnType<typeof useSignUpForm>;
  mount(
    defineComponent({
      setup: () => {
        result = useSignUpForm();
        return () => null;
      },
    })
  );
  Object.assign(result.form, VALID, values);
  return result;
}

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
const httpError = (status: number, data: unknown = { statusCode: status, message: "Failed" }) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    data,
    status,
    statusText: "",
    headers: {} as RawAxiosResponseHeaders,
    config,
  });

describe("useSignUpForm", () => {
  it("accepts a valid form", async () => {
    const form = setup();

    await expect(form.validate()).resolves.toBe(true);
    expect(form.errors.value).toEqual({});
  });

  it.each([
    ["Sh1!a", "Password must be at least 6 characters"],
    ["secret1!", "Password must contain at least one uppercase letter"],
    ["SECRET1!", "Password must contain at least one lowercase letter"],
    ["Secret!!", "Password must contain at least one digit"],
    ["Secret12", "Password must contain at least one special character"],
  ])("rejects the password %s with the first unmet rule", async (password, message) => {
    const form = setup({ password, confirmPassword: password });

    await expect(form.validate()).resolves.toBe(false);
    expect(form.errors.value.password).toBe(message);
  });

  it("reports the earliest unmet password rule first", async () => {
    const form = setup({ password: "abc", confirmPassword: "abc" });

    await form.validate();

    expect(form.errors.value.password).toBe("Password must be at least 6 characters");
  });

  it("rejects a mismatched confirmation", async () => {
    const form = setup({ confirmPassword: "Secret2!" });

    await expect(form.validate()).resolves.toBe(false);
    expect(form.errors.value.confirmPassword).toBe("Passwords do not match");
  });

  it.each([
    [{ name: "  " }, "name", "First name is required"],
    [{ surname: "" }, "surname", "Last name is required"],
    [{ name: "a".repeat(101) }, "name", "First name must be at most 100 characters"],
    [{ email: "mario" }, "email", "Please enter a valid email"],
    [{ confirmPassword: "" }, "confirmPassword", "Please confirm your password"],
  ] as const)("rejects %o", async (values, field, message) => {
    const form = setup(values);

    await expect(form.validate()).resolves.toBe(false);
    expect(form.errors.value[field]).toBe(message);
  });

  it("allows a 100-character name after trimming", async () => {
    const form = setup({ name: ` ${"a".repeat(100)} ` });

    await expect(form.validate()).resolves.toBe(true);
  });

  it("points at the first invalid field in form order", async () => {
    const form = setup({ email: "bad", confirmPassword: "nope" });

    await form.validate();

    expect(form.firstInvalidField.value).toBe("email");
  });

  it("builds a trimmed payload", () => {
    const form = setup({ name: " Mario ", surname: " Rossi ", email: " mario@x.io " });

    expect(form.toPayload()).toEqual(VALID);
  });

  it("maps a 409 onto the email field until the email changes", async () => {
    const form = setup();

    form.applyServerError(httpError(409, { statusCode: 409, message: "exists" }));

    expect(form.errors.value.email).toBe(EMAIL_TAKEN_MESSAGE);
    expect(form.firstInvalidField.value).toBe("email");
    expect(form.formError.value).toBeNull();

    form.form.email = "luigi@x.io";
    await nextTick();

    expect(form.errors.value.email).toBeUndefined();
  });

  it("maps server field errors onto the fields", () => {
    const form = setup();

    form.applyServerError(
      httpError(400, { formErrors: [], fieldErrors: { password: ["Too weak"], other: ["x"] } })
    );

    expect(form.errors.value).toEqual({ password: "Too weak" });
  });

  it("shows the throttle message on 429", () => {
    const form = setup();

    form.applyServerError(httpError(429));

    expect(form.formError.value).toBe("Too many attempts, try again in a minute");
  });

  it("clears server errors on the next validation", async () => {
    const form = setup();
    form.applyServerError(httpError(500, { statusCode: 500, message: "Boom" }));
    expect(form.formError.value).toBe("Boom");

    await form.validate();

    expect(form.formError.value).toBeNull();
  });
});
