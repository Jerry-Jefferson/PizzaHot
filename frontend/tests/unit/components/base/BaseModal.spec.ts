import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { afterEach, describe, expect, it } from "vitest";

import BaseModal from "@/components/base/BaseModal.vue";

let wrapper: VueWrapper | undefined;

async function mountModal(persistent = false) {
  wrapper = mount(BaseModal, {
    attachTo: document.body,
    props: { header: "Edit promo code", visible: true, persistent },
    slots: { default: "<input id='modal-field' />" },
    global: { plugins: [PrimeVue], stubs: { transition: false } },
  });
  await flushPromises();
  return wrapper;
}

async function pressEscape() {
  document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", key: "Escape" }));
  await flushPromises();
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("BaseModal", () => {
  it("renders an accessible modal dialog with its header", async () => {
    await mountModal();

    const dialog = document.querySelector("[role='dialog']");
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(dialog?.textContent).toContain("Edit promo code");
    expect(document.querySelector("[aria-label='Close']")).not.toBeNull();
  });

  it("closes on Escape", async () => {
    const modal = await mountModal();

    await pressEscape();

    expect(modal.emitted("update:visible")).toEqual([[false]]);
  });

  it("can't be dismissed while persistent", async () => {
    const modal = await mountModal(true);

    await pressEscape();

    expect(modal.emitted("update:visible")).toBeUndefined();
    expect(document.querySelector("[aria-label='Close']")).toBeNull();
  });
});
