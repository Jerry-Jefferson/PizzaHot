import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick, ref } from "vue";

import { usePersonalInfoForm } from "@/composables/usePersonalInfoForm";
import type { User } from "@/types/user.types";

const user = (overrides: Partial<User> = {}): User => ({
  id: "u1",
  role: "user",
  email: "mario@x.io",
  name: "Mario",
  surname: "Rossi",
  gender: "male",
  image: null,
  isEmailVerified: true,
  createdAt: "2024-03-15T10:00:00.000Z",
  updatedAt: "2024-03-15T10:00:00.000Z",
  ...overrides,
});

function setup(initial: User | null) {
  const source = ref<User | null>(initial);
  let result!: ReturnType<typeof usePersonalInfoForm>;
  mount(
    defineComponent({
      setup: () => {
        result = usePersonalInfoForm(source);
        return () => null;
      },
    })
  );
  return { source, ...result };
}

describe("usePersonalInfoForm", () => {
  it("prefills the form from the user", () => {
    const { form } = setup(user());

    expect({ ...form }).toEqual({ name: "Mario", surname: "Rossi", gender: "male" });
  });

  it("uses empty values for missing fields", () => {
    const { form } = setup(user({ name: null, surname: null, gender: null }));

    expect({ ...form }).toEqual({ name: "", surname: "", gender: "" });
  });

  it("always sends name, surname and gender", () => {
    const { toPayload } = setup(user());

    expect(toPayload()).toEqual({ name: "Mario", surname: "Rossi", gender: "male" });
  });

  it("trims values and sends blanks as null", () => {
    const { form, toPayload } = setup(user());
    form.name = "  Luigi ";
    form.surname = "   ";
    form.gender = "";

    expect(toPayload()).toEqual({ name: "Luigi", surname: null, gender: null });
  });

  it.each([
    ["name", "First name must be at most 100 characters"],
    ["surname", "Last name must be at most 100 characters"],
  ] as const)("limits %s to 100 characters after trimming", async (field, message) => {
    const { form, validate, errors } = setup(user());

    form[field] = ` ${"a".repeat(100)} `;
    await expect(validate()).resolves.toBe(true);

    form[field] = "a".repeat(101);
    await expect(validate()).resolves.toBe(false);
    expect(errors.value[field]).toBe(message);
  });

  it("allows clearing the names", async () => {
    const { form, validate } = setup(user());
    form.name = "";
    form.surname = "";

    await expect(validate()).resolves.toBe(true);
  });

  it("resyncs when the user changes", async () => {
    const { form, source } = setup(user());
    form.name = "Draft";

    source.value = user({ name: "Luigi", gender: "female" });
    await nextTick();

    expect(form.name).toBe("Luigi");
    expect(form.gender).toBe("female");
  });
});
