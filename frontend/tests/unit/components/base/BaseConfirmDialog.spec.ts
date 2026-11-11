import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";

import BaseConfirmDialog from "@/components/base/BaseConfirmDialog.vue";
import BaseToast from "@/components/base/BaseToast.vue";
import { type ConfirmDangerOptions, useConfirmDanger } from "@/composables/useConfirmDanger";

let wrapper: VueWrapper | undefined;

function setup(options: Partial<ConfirmDangerOptions> = {}) {
  const onConfirm = options.onConfirm ?? vi.fn();
  const Host = defineComponent({
    setup() {
      const confirmDanger = useConfirmDanger();
      const open = () => {
        confirmDanger({
          title: "Delete account?",
          message: "This cannot be undone.",
          confirmLabel: "Delete account",
          ...options,
          onConfirm,
        });
      };
      return () => [h("button", { id: "open", onClick: open }), h(BaseConfirmDialog), h(BaseToast)];
    },
  });
  wrapper = mount(Host, {
    attachTo: document.body,
    global: { plugins: [PrimeVue, ConfirmationService, ToastService] },
  });
  return { onConfirm };
}

async function open(): Promise<void> {
  await wrapper?.get("#open").trigger("click");
  await flushPromises();
}

const dialog = () => document.body.querySelector("[role='alertdialog']");
const buttonByText = (text: string) =>
  Array.from(document.body.querySelectorAll<HTMLButtonElement>("button")).find(
    (button) => button.textContent.trim() === text
  );

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("BaseConfirmDialog with useConfirmDanger", () => {
  it("shows the title, message and labels", async () => {
    setup();
    await open();

    expect(dialog()?.textContent).toContain("Delete account?");
    expect(dialog()?.textContent).toContain("This cannot be undone.");
    expect(buttonByText("Delete account")).toBeDefined();
    expect(buttonByText("Cancel")).toBeDefined();
  });

  it("stays open while the action runs and closes once it succeeds", async () => {
    let resolveAction: () => void = () => undefined;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAction = resolve;
        })
    );
    setup({ onConfirm });
    await open();

    buttonByText("Delete account")?.click();
    await flushPromises();

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(dialog()).not.toBeNull();
    expect(buttonByText("Cancel")?.disabled).toBe(true);

    resolveAction();
    await flushPromises();

    expect(dialog()).toBeNull();
  });

  it("stays open and shows an error toast when the action fails", async () => {
    setup({ onConfirm: vi.fn().mockRejectedValue(new Error("Account is locked")) });
    await open();

    buttonByText("Delete account")?.click();
    await flushPromises();

    expect(dialog()).not.toBeNull();
    expect(document.body.querySelector("[data-severity='error']")?.textContent).toContain(
      "Account is locked"
    );
  });

  it("closes on cancel without running the action", async () => {
    const { onConfirm } = setup();
    await open();

    buttonByText("Cancel")?.click();
    await flushPromises();

    expect(onConfirm).not.toHaveBeenCalled();
    expect(dialog()).toBeNull();
  });
});
