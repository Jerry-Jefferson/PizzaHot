import ToastService from "primevue/toastservice";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";
import { createApp, defineComponent } from "vue";

import { errorHandlerPlugin } from "@/plugins/error-handler";

const { toastAdd } = vi.hoisted(() => ({
  toastAdd: vi.fn<(toast: { severity?: string; summary?: string }) => void>(),
}));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add: toastAdd }) }));

const SETUP_ERROR = new Error("setup failed");

const FailingComponent = defineComponent(() => {
  throw SETUP_ERROR;
});

let consoleError: MockInstance<typeof console.error>;

beforeEach(() => {
  toastAdd.mockReset();
  consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  consoleError.mockRestore();
});

describe("errorHandlerPlugin", () => {
  it("logs an unhandled component error and shows a generic toast", () => {
    const app = createApp(FailingComponent).use(ToastService).use(errorHandlerPlugin);

    app.mount(document.createElement("div"));

    expect(consoleError).toHaveBeenCalledWith("[vue:setup function]", SETUP_ERROR);
    expect(toastAdd).toHaveBeenCalledTimes(1);
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", summary: "Something went wrong" })
    );
    app.unmount();
  });
});
