import { describe, expect, it } from "vitest";

import { ApiError } from "@/services/errors";
import { FALLBACK_ERROR_MESSAGE } from "@/utils/constants/errors.constants";
import {
  getErrorMessage,
  getErrorStatus,
  getFieldErrors,
  getFirstFieldErrors,
  isEmailNotVerifiedError,
} from "@/utils/errors";

describe("getFieldErrors", () => {
  it("returns the field errors of an ApiError", () => {
    const error = new ApiError("Invalid email", {
      status: 400,
      fieldErrors: { email: ["Invalid email"] },
    });

    expect(getFieldErrors(error)).toEqual({ email: ["Invalid email"] });
  });

  it.each([
    ["an ApiError without field errors", new ApiError("Not found", { status: 404 })],
    ["a plain Error", new Error("boom")],
    ["a non-error value", "oops"],
  ])("returns an empty object for %s", (_name, error) => {
    expect(getFieldErrors(error)).toEqual({});
  });
});

describe("getErrorStatus", () => {
  it("returns the status of an ApiError", () => {
    expect(getErrorStatus(new ApiError("Taken", { status: 409 }))).toBe(409);
  });

  it.each([
    ["an ApiError without a status", new ApiError("Offline", { status: undefined })],
    ["a plain Error", new Error("x")],
  ])("returns undefined for %s", (_name, error) => {
    expect(getErrorStatus(error)).toBeUndefined();
  });
});

describe("getErrorMessage", () => {
  it.each([
    [new ApiError("Pizza not found", { status: 404 }), "Pizza not found"],
    [new Error("Pizza id is required"), "Pizza id is required"],
    [new Error(""), FALLBACK_ERROR_MESSAGE],
    ["oops", FALLBACK_ERROR_MESSAGE],
  ])("reads the message %#", (error, expected) => {
    expect(getErrorMessage(error)).toBe(expected);
  });
});

describe("getFirstFieldErrors", () => {
  it("keeps the first message of the requested fields only", () => {
    const error = new ApiError("Invalid email", {
      status: 400,
      fieldErrors: { email: ["Invalid email", "Second"], role: ["Nope"] },
    });

    expect(getFirstFieldErrors(error, ["email", "password"])).toEqual({ email: "Invalid email" });
  });

  it("returns an empty object for errors without field errors", () => {
    expect(getFirstFieldErrors(new Error("boom"), ["email"])).toEqual({});
  });
});

describe("isEmailNotVerifiedError", () => {
  it("recognises the order guard response", () => {
    const error = new ApiError("Email is not verified. Please verify your email first.", {
      status: 403,
    });

    expect(isEmailNotVerifiedError(error)).toBe(true);
  });

  it.each([
    ["another 403", new ApiError("Forbidden resource", { status: 403 })],
    ["a 400 with the same text", new ApiError("Email is not verified", { status: 400 })],
    ["an error without a status", new ApiError("Email is not verified", { status: undefined })],
    ["a plain Error", new Error("Email is not verified")],
  ])("ignores %s", (_label, error) => {
    expect(isEmailNotVerifiedError(error)).toBe(false);
  });
});
