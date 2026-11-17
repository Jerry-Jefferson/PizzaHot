import { mount } from "@vue/test-utils";
import { helpers, required } from "@vuelidate/validators";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick, reactive } from "vue";

import { useValidatedForm } from "@/composables/useValidatedForm";
import { ApiError } from "@/services/errors";

type Field = "email" | "name";
const FIELDS: readonly Field[] = ["email", "name"];

function setup() {
  const form = reactive<Record<Field, string>>({ email: "", name: "" });
  const rules = {
    email: { required: helpers.withMessage("Email is required", required) },
    name: { required: helpers.withMessage("Name is required", required) },
  };
  let result!: ReturnType<typeof useValidatedForm<Field>>;
  mount(
    defineComponent({
      setup: () => {
        result = useValidatedForm(FIELDS, form, rules);
        return () => null;
      },
    })
  );
  return { form, ...result };
}

const serverFieldError = (field: Field, message: string): ApiError =>
  new ApiError(message, { status: 400, fieldErrors: { [field]: [message] } });

describe("useValidatedForm", () => {
  it("shows no errors before the form is touched or validated", () => {
    const { errors, firstInvalidField } = setup();

    expect(errors.value).toEqual({});
    expect(firstInvalidField.value).toBeUndefined();
  });

  it("reports client errors on validate in field order", async () => {
    const { validate, errors, firstInvalidField } = setup();

    expect(await validate()).toBe(false);
    expect(errors.value).toEqual({ email: "Email is required", name: "Name is required" });
    expect(firstInvalidField.value).toBe("email");
  });

  it("shows a touched field's client error only", async () => {
    const { touch, errors } = setup();

    touch("name");
    await nextTick();

    expect(errors.value).toEqual({ name: "Name is required" });
  });

  it("shows a server field error when the client rules pass", async () => {
    const { form, validate, server, errors, firstInvalidField } = setup();
    form.email = "taken@x.io";
    form.name = "Mario";
    expect(await validate()).toBe(true);

    server.apply(serverFieldError("email", "Email is taken"));

    expect(errors.value).toEqual({ email: "Email is taken" });
    expect(firstInvalidField.value).toBe("email");
  });

  it("prefers the client error over a server error for the same field", async () => {
    const { form, touch, server, errors } = setup();
    form.name = "Mario";
    server.apply(serverFieldError("email", "Email is taken"));

    touch("email");
    await nextTick();

    expect(errors.value.email).toBe("Email is required");
  });

  it("clears server errors and the form error on validate", async () => {
    const { form, validate, server, errors, formError } = setup();
    form.email = "mario@x.io";
    form.name = "Mario";
    server.apply(serverFieldError("name", "Name is reserved"));
    server.apply(new ApiError("Server down", { status: 500 }));

    await validate();

    expect(errors.value).toEqual({});
    expect(formError.value).toBeNull();
  });
});
