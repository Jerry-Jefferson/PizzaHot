import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from "axios";
import { describe, expect, it } from "vitest";

import {
  FALLBACK_ERROR_MESSAGE,
  getErrorMessage,
  getFieldErrors,
  NETWORK_ERROR_MESSAGE,
} from "@/api/errors";

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;

const httpError = (status: number, data: unknown): AxiosError =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    data,
    status,
    statusText: "",
    headers: {} as RawAxiosResponseHeaders,
    config,
  });

const networkError = (): AxiosError => new AxiosError("Network Error", "ERR_NETWORK", config, {});

describe("getFieldErrors", () => {
  it("returns non-empty field errors from a validation body", () => {
    const error = httpError(400, {
      formErrors: [],
      fieldErrors: { email: ["Invalid email"], password: undefined, name: [] },
    });

    expect(getFieldErrors(error)).toEqual({ email: ["Invalid email"] });
  });

  it.each([
    ["a Nest error body", httpError(404, { statusCode: 404, message: "Not found" })],
    ["a network error", networkError()],
    ["a plain Error", new Error("boom")],
  ])("returns an empty object for %s", (_name, error) => {
    expect(getFieldErrors(error)).toEqual({});
  });
});

describe("getErrorMessage", () => {
  it("prefers the first form error of a validation body", () => {
    const error = httpError(400, {
      formErrors: ["Passwords do not match"],
      fieldErrors: { email: ["Invalid email"] },
    });

    expect(getErrorMessage(error)).toBe("Passwords do not match");
  });

  it("falls back to the first field error", () => {
    const error = httpError(400, { formErrors: [], fieldErrors: { email: ["Invalid email"] } });

    expect(getErrorMessage(error)).toBe("Invalid email");
  });

  it("uses a generic message for an empty validation body", () => {
    expect(getErrorMessage(httpError(400, { formErrors: [], fieldErrors: {} }))).toBe(
      "Please check the highlighted fields."
    );
  });

  it.each([
    [{ statusCode: 404, message: "Pizza not found" }, "Pizza not found"],
    [{ statusCode: 400, message: ["a is bad", "b is bad"] }, "a is bad, b is bad"],
    [{ statusCode: 500, message: "" }, FALLBACK_ERROR_MESSAGE],
    ["<html>Bad Gateway</html>", FALLBACK_ERROR_MESSAGE],
  ])("reads a Nest error body %#", (body, expected) => {
    expect(getErrorMessage(httpError(502, body))).toBe(expected);
  });

  it("reports a request without a response as a network error", () => {
    expect(getErrorMessage(networkError())).toBe(NETWORK_ERROR_MESSAGE);
  });

  it.each([
    [new Error("Pizza id is required"), "Pizza id is required"],
    [new Error(""), FALLBACK_ERROR_MESSAGE],
    ["oops", FALLBACK_ERROR_MESSAGE],
  ])("handles a non-axios error %#", (error, expected) => {
    expect(getErrorMessage(error)).toBe(expected);
  });
});
