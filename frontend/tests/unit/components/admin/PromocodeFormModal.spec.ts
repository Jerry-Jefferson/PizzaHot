import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { afterEach, describe, expect, it, vi } from "vitest";

import PromocodeFormModal from "@/components/admin/PromocodeFormModal.vue";
import type { DiscountMode, PromocodeFormErrors, PromocodeFormMode } from "@/types/promocode.types";

vi.stubGlobal(
  "matchMedia",
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
);

interface ModalProps {
  mode?: PromocodeFormMode;
  code?: string;
  discount?: number | null;
  discountMode?: DiscountMode;
  validTill?: Date | null;
  isActive?: boolean;
  errors?: PromocodeFormErrors;
  formError?: string | null;
  saving?: boolean;
}

let wrapper: VueWrapper | undefined;

async function mountModal(props: ModalProps = {}) {
  wrapper = mount(PromocodeFormModal, {
    props: {
      visible: true,
      mode: "create",
      code: "",
      discount: null,
      discountMode: "percentage",
      validTill: null,
      ...props,
    },
    attachTo: document.body,
    global: { plugins: [PrimeVue] },
  });
  await flushPromises();
  return wrapper;
}

const query = (selector: string) => document.querySelector<HTMLElement>(selector);

const inputAt = (selector: string) => document.querySelector<HTMLInputElement>(selector);

const button = (label: string) =>
  [...document.querySelectorAll<HTMLButtonElement>("button")].find(
    (element) => element.textContent.trim() === label
  );

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("PromocodeFormModal", () => {
  it("creates a code without an Active switch", async () => {
    await mountModal({ mode: "create" });

    expect(document.body.textContent).toContain("New Promo Code");
    expect(query("[data-test='promocode-active']")).toBeNull();
    expect(query("#promocode-active")).toBeNull();
    expect(button("Create code")).toBeDefined();
  });

  it("edits a code with its Active switch", async () => {
    await mountModal({ mode: "edit", isActive: false });

    expect(document.body.textContent).toContain("Edit Promo Code");
    expect(inputAt("#promocode-active")?.checked).toBe(false);
    expect(button("Save changes")).toBeDefined();
  });

  it("emits the Active switch change", async () => {
    const modal = await mountModal({ mode: "edit", isActive: true });

    inputAt("#promocode-active")?.click();
    await flushPromises();

    expect(modal.emitted("update:isActive")).toEqual([[false]]);
  });

  it("upper-cases the code as it is typed", async () => {
    const modal = await mountModal();
    const input = inputAt("#promocode-code");
    if (!input) {
      throw new Error("No code input");
    }

    input.value = "welcome20";
    input.dispatchEvent(new Event("input"));

    expect(modal.emitted("update:code")).toEqual([["WELCOME20"]]);
    expect(input.maxLength).toBe(50);
  });

  it.each([
    ["percentage", "20%"],
    ["fixed_amount", "$20"],
  ] as const)("shows a %s discount as %s", async (discountMode, shown) => {
    await mountModal({ discount: 20, discountMode });

    expect(inputAt("#promocode-discount")?.value).toBe(shown);
  });

  it("shows the chosen discount type", async () => {
    await mountModal({ discountMode: "fixed_amount" });

    expect(query("[data-test='promocode-form'] [role='combobox']")?.textContent.trim()).toBe(
      "Fixed amount ($)"
    );
  });

  it("shows the expiry date", async () => {
    await mountModal({ validTill: new Date(2026, 11, 31) });

    expect(inputAt("#promocode-valid-till")?.value).toBe("Dec 31, 2026");
  });

  it("shows field errors and a form error", async () => {
    await mountModal({
      errors: { code: "Code cannot be empty", validTill: "Choose an expiry date" },
      formError: "Turn the code on to edit it",
    });

    expect(document.body.textContent).toContain("Code cannot be empty");
    expect(document.body.textContent).toContain("Choose an expiry date");
    expect(query("[data-test='form-error']")?.textContent).toContain("Turn the code on to edit it");
  });

  it("submits the form", async () => {
    const modal = await mountModal();

    query("[data-test='promocode-form']")?.dispatchEvent(new Event("submit", { cancelable: true }));

    expect(modal.emitted("submit")).toHaveLength(1);
  });

  it("reports which field lost focus", async () => {
    const modal = await mountModal();

    query("#promocode-code")?.dispatchEvent(new Event("blur"));

    expect(modal.emitted("blur")).toEqual([["code"]]);
  });

  it("closes on Cancel", async () => {
    const modal = await mountModal();

    button("Cancel")?.click();

    expect(modal.emitted("update:visible")).toEqual([[false]]);
  });

  it("locks the form while saving", async () => {
    await mountModal({ mode: "edit", saving: true });

    expect(inputAt("#promocode-code")?.disabled).toBe(true);
    expect(inputAt("#promocode-active")?.disabled).toBe(true);
    expect(button("Cancel")?.disabled).toBe(true);
    expect(
      document.querySelector<HTMLButtonElement>("[data-test='promocode-submit']")?.disabled
    ).toBe(true);
  });
});
