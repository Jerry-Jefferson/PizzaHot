import { describe, it, expect } from "@jest/globals";
import { BadRequestException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { buildRpcErrorPayload, isRpcErrorPayload, toHttpException } from "../rpc-error.ts";

describe("isRpcErrorPayload", () => {
  it("recognises a payload this system produced", () => {
    expect(isRpcErrorPayload({ __rpc: true, status: 404, message: "gone", error: "E" })).toBe(true);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["a string", "boom"],
    ["an object without the marker", { status: 404 }],
    ["a marker without a numeric status", { __rpc: true, status: "404" }],
  ])("rejects %s", (_label, value) => {
    expect(isRpcErrorPayload(value)).toBe(false);
  });
});

describe("buildRpcErrorPayload", () => {
  it("keeps the status and message of an HttpException", () => {
    expect(buildRpcErrorPayload(new NotFoundException("Pizza not found"))).toEqual({
      __rpc: true,
      status: HttpStatus.NOT_FOUND,
      message: "Pizza not found",
      error: "NotFoundException",
    });
  });

  it("joins a list of validation messages into one line", () => {
    const payload = buildRpcErrorPayload(new BadRequestException(["name required", "price > 0"]));

    expect(payload.message).toBe("name required, price > 0");
    expect(payload.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it("handles an HttpException whose response is a plain string", () => {
    const payload = buildRpcErrorPayload(new HttpException("teapot", HttpStatus.I_AM_A_TEAPOT));

    expect(payload).toMatchObject({ status: HttpStatus.I_AM_A_TEAPOT, message: "teapot" });
  });

  it("hides the detail of an unexpected error", () => {
    expect(buildRpcErrorPayload(new TypeError("cannot read property of undefined"))).toEqual({
      __rpc: true,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      error: "TypeError",
    });
  });

  it("copes with something thrown that is not an Error", () => {
    expect(buildRpcErrorPayload("just a string")).toMatchObject({ error: "UnknownError" });
  });
});

describe("toHttpException", () => {
  it("restores the original status on the caller's side", () => {
    const exception = toHttpException({
      __rpc: true,
      status: 409,
      message: "Already exists",
      error: "ConflictException",
    });

    expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(exception.message).toBe("Already exists");
  });

  it.each(["TimeoutError", "EmptyError"])("turns %s into 504", (name) => {
    const error = new Error("no answer");
    error.name = name;

    const exception = toHttpException(error);

    expect(exception.getStatus()).toBe(HttpStatus.GATEWAY_TIMEOUT);
    expect(exception.message).toBe("Upstream service did not respond in time");
  });

  it("falls back to 503 for anything else", () => {
    const exception = toHttpException(new Error("socket closed"));

    expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(exception.message).toBe("Upstream service is unavailable");
  });
});
