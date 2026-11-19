import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from "axios";
import { describe, expect, it } from "vitest";

import { ApiError, toApiError } from "@/services/errors";
import {
  FALLBACK_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  VALIDATION_ERROR_MESSAGE,
} from "@/utils/constants/errors.constants";

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;

const axiosHttpError = (status: number, data: unknown): AxiosError =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    data,
    status,
    statusText: "",
    headers: {} as RawAxiosResponseHeaders,
    config,
  });

const axiosNetworkError = (): AxiosError =>
  new AxiosError("Network Error", "ERR_NETWORK", config, {});

describe("toApiError", () => {
  it("turns an axios response error into an ApiError", () => {
    const error = toApiError(
      axiosHttpError(400, { formErrors: [], fieldErrors: { email: ["Invalid email"] } })
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      message: "Invalid email",
      fieldErrors: { email: ["Invalid email"] },
    });
  });

  it("gives a network error no status", () => {
    expect(toApiError(axiosNetworkError())).toMatchObject({
      status: undefined,
      message: NETWORK_ERROR_MESSAGE,
      fieldErrors: {},
    });
  });

  it.each([new Error("boom"), "oops"])("returns a non-axios error unchanged: %o", (error) => {
    expect(toApiError(error)).toBe(error);
  });
});

describe("toApiError with a validation body", () => {
  it("keeps only non-empty field errors", () => {
    const error = toApiError(
      axiosHttpError(400, {
        formErrors: [],
        fieldErrors: { email: ["Invalid email"], password: undefined, name: [] },
      })
    );

    expect(error).toMatchObject({ fieldErrors: { email: ["Invalid email"] } });
  });

  it("prefers the first form error as the message", () => {
    const error = toApiError(
      axiosHttpError(400, {
        formErrors: ["Passwords do not match"],
        fieldErrors: { email: ["Invalid email"] },
      })
    );

    expect(error).toMatchObject({ message: "Passwords do not match" });
  });

  it("falls back to the first field error", () => {
    const error = toApiError(
      axiosHttpError(400, { formErrors: [], fieldErrors: { email: ["Invalid email"] } })
    );

    expect(error).toMatchObject({ message: "Invalid email" });
  });

  it("uses a generic message for an empty body", () => {
    const error = toApiError(axiosHttpError(400, { formErrors: [], fieldErrors: {} }));

    expect(error).toMatchObject({ message: VALIDATION_ERROR_MESSAGE });
  });
});

describe("toApiError with a Nest error body", () => {
  it.each([
    [{ statusCode: 404, message: "Pizza not found" }, "Pizza not found"],
    [{ statusCode: 400, message: ["a is bad", "b is bad"] }, "a is bad, b is bad"],
    [{ statusCode: 500, message: "" }, FALLBACK_ERROR_MESSAGE],
    ["<html>Bad Gateway</html>", FALLBACK_ERROR_MESSAGE],
  ])("reads the message %#", (body, expected) => {
    expect(toApiError(axiosHttpError(502, body))).toMatchObject({
      message: expected,
      fieldErrors: {},
    });
  });
});
