import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, type MaybeRefOrGetter, ref } from "vue";

import { usePromocodeForm } from "@/composables/catalog/usePromocodeForm";
import { ApiError } from "@/services/errors";
import type { Promocode, PromocodeFormMode } from "@/types/promocode.types";
import {
  INACTIVE_PROMOCODE_EDIT_MESSAGE,
  PROMOCODE_CODE_TAKEN_MESSAGE,
} from "@/utils/constants/promocode.constants";

const NOW = new Date(2026, 10, 18, 15, 30);

const promocode = (overrides: Partial<Promocode> = {}): Promocode => ({
  id: "c1",
  code: "WELCOME20",
  discount: 20,
  discountMode: "percentage",
  validTill: new Date(2026, 11, 31, 23, 59, 59, 999).toISOString(),
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
  deletedAt: null,
  ...overrides,
});

function withForm(mode: MaybeRefOrGetter<PromocodeFormMode> = "create") {
  let result!: ReturnType<typeof usePromocodeForm>;
  mount(
    defineComponent({
      setup: () => {
        result = usePromocodeForm(mode);
        return () => null;
      },
    })
  );
  return result;
}

function fillValid(form: ReturnType<typeof usePromocodeForm>): void {
  form.form.code = "summer10";
  form.form.discount = 10;
  form.form.discountMode = "fixed_amount";
  form.form.validTill = new Date(2026, 11, 1);
}

afterEach(() => {
  vi.useRealTimers();
});

describe("usePromocodeForm", () => {
  it("starts empty with a percentage discount and the code switched on", () => {
    const form = withForm();

    expect(form.form).toEqual({
      code: "",
      discount: null,
      discountMode: "percentage",
      validTill: null,
    });
    expect(form.isActive.value).toBe(true);
  });

  it("requires a code, a positive whole discount and an expiry date", async () => {
    const form = withForm();
    form.form.code = "   ";
    form.form.discount = 0;

    expect(await form.validate()).toBe(false);
    expect(form.errors.value).toEqual({
      code: "Code cannot be empty",
      discount: "Discount must be a positive whole number",
      validTill: "Choose an expiry date",
    });
  });

  it("limits the code to 50 characters", async () => {
    const form = withForm();
    fillValid(form);
    form.form.code = "X".repeat(51);

    expect(await form.validate()).toBe(false);
    expect(form.errors.value.code).toBe("Code cannot exceed 50 characters");
  });

  it("caps a percentage discount at 100 but not a fixed amount", async () => {
    const form = withForm();
    fillValid(form);
    form.form.discount = 150;

    expect(await form.validate()).toBe(true);

    form.form.discountMode = "percentage";
    expect(await form.validate()).toBe(false);
    expect(form.errors.value.discount).toBe("Percentage discount cannot exceed 100");

    form.form.discount = 100;
    expect(await form.validate()).toBe(true);
  });

  it("requires a future expiry date when creating", async () => {
    vi.useFakeTimers({ now: NOW });
    const form = withForm("create");
    fillValid(form);
    form.form.validTill = new Date(2026, 10, 18);

    expect(await form.validate()).toBe(false);
    expect(form.errors.value.validTill).toBe("Expiry date must be in the future");

    form.form.validTill = new Date(2026, 10, 19);
    expect(await form.validate()).toBe(true);
  });

  it("accepts a past expiry date when editing", async () => {
    vi.useFakeTimers({ now: NOW });
    const form = withForm("edit");
    fillValid(form);
    form.form.validTill = new Date(2026, 0, 1);

    expect(await form.validate()).toBe(true);
  });

  it("follows a mode that changes after setup", async () => {
    vi.useFakeTimers({ now: NOW });
    const mode = ref<PromocodeFormMode>("edit");
    const form = withForm(mode);
    fillValid(form);
    form.form.validTill = new Date(2026, 0, 1);
    expect(await form.validate()).toBe(true);

    mode.value = "create";
    expect(await form.validate()).toBe(false);
  });

  it("fills from a promo code, including its Active state", () => {
    const form = withForm("edit");

    form.fill(promocode({ deletedAt: "2026-11-10T00:00:00.000Z" }));

    expect(form.form).toEqual({
      code: "WELCOME20",
      discount: 20,
      discountMode: "percentage",
      validTill: new Date(2026, 11, 31),
    });
    expect(form.isActive.value).toBe(false);
  });

  it("clears the previous code and its errors when filled for a new one", async () => {
    const form = withForm();
    form.fill(promocode());
    form.form.code = "";
    await form.validate();

    form.fill();

    expect(form.form.code).toBe("");
    expect(form.isActive.value).toBe(true);
    expect(form.errors.value).toEqual({});
  });

  it("builds an upper-case payload that expires at the end of the chosen day", () => {
    const form = withForm();
    fillValid(form);
    form.form.code = "  summer10 ";

    expect(form.toPayload()).toEqual({
      code: "SUMMER10",
      discount: 10,
      discountMode: "fixed_amount",
      validTill: new Date(2026, 11, 1, 23, 59, 59, 999).toISOString(),
    });
  });

  it("shows a taken code on the code field", () => {
    const form = withForm();

    form.applyServerError(new ApiError("Promocode with this code already exists", { status: 409 }));

    expect(form.errors.value.code).toBe(PROMOCODE_CODE_TAKEN_MESSAGE);
  });

  it("asks to switch an inactive code on before editing it", () => {
    const form = withForm("edit");
    form.fill(promocode({ deletedAt: "2026-11-10T00:00:00.000Z" }));

    form.applyServerError(new ApiError("Promocode not found", { status: 404 }));

    expect(form.formError.value).toBe(INACTIVE_PROMOCODE_EDIT_MESSAGE);
  });

  it("reports a missing active code as a plain error", () => {
    const form = withForm("edit");
    form.fill(promocode());

    form.applyServerError(new ApiError("Promocode not found", { status: 404 }));

    expect(form.formError.value).toBe("Promocode not found");
  });
});
