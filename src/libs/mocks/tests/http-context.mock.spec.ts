import { describe, it, expect } from "@jest/globals";
import type { ExecutionContext } from "@nestjs/common";
import { createHttpExecutionContext } from "../http-context.mock.ts";

describe("createHttpExecutionContext", () => {
  it("hands back the request and response it was given", () => {
    const request = { url: "/api" };
    const response = { statusCode: 200 };

    const context: ExecutionContext = createHttpExecutionContext(request, response);

    expect(context.switchToHttp().getRequest()).toBe(request);
    expect(context.switchToHttp().getResponse()).toBe(response);
  });

  it.each([
    ["getNext", (context: ExecutionContext): void => void context.switchToHttp().getNext()],
    ["switchToRpc", (context: ExecutionContext): void => void context.switchToRpc()],
    ["switchToWs", (context: ExecutionContext): void => void context.switchToWs()],
    ["getType", (context: ExecutionContext): void => void context.getType()],
    ["getArgs", (context: ExecutionContext): void => void context.getArgs()],
    ["getArgByIndex", (context: ExecutionContext): void => void context.getArgByIndex(0)],
    ["getClass", (context: ExecutionContext): void => void context.getClass()],
    ["getHandler", (context: ExecutionContext): void => void context.getHandler()],
  ])("throws a named error for %s", (name, call) => {
    const context = createHttpExecutionContext({}, {});

    expect(() => call(context)).toThrow(`${name}() is not provided`);
  });
});
