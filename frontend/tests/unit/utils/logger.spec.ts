import { afterEach, describe, expect, it, vi } from "vitest";

import { logError } from "@/utils/logger";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("logError", () => {
  it("logs the error with its context", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const error = new Error("boom");

    logError("Navigation")(error);

    expect(consoleError).toHaveBeenCalledWith("[Navigation]", error);
  });

  it("handles a rejected promise", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await Promise.reject(new Error("boom")).catch(logError("Refetch"));

    expect(consoleError).toHaveBeenCalledOnce();
  });
});
