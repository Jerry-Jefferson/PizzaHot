import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { type CallHandler, type ExecutionContext, Logger, NotFoundException } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom, of, throwError, type Observable } from "rxjs";
import { HttpLoggingInterceptor } from "../http-logging.interceptor.ts";
import { RmqLoggerService } from "../rmq-logger.service.ts";
import { LogLevel } from "../log-level.constant.ts";
import { EVENTS } from "../../contracts/index.ts";
import type { LogWrittenEvent } from "../../contracts/index.ts";

function httpContext(request: object, response: object, type = "http"): ExecutionContext {
  return {
    getType: () => type,
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
  } as unknown as ExecutionContext;
}

function handlerReturning(stream: Observable<unknown>): CallHandler {
  return { handle: () => stream } as CallHandler;
}

describe("HttpLoggingInterceptor", () => {
  let interceptor: HttpLoggingInterceptor;
  let log: jest.SpiedFunction<Logger["log"]>;
  let error: jest.SpiedFunction<Logger["error"]>;

  beforeEach(() => {
    interceptor = new HttpLoggingInterceptor();
    log = jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
    error = jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    log.mockRestore();
    error.mockRestore();
  });

  it("leaves a non-http call alone", async () => {
    const next = handlerReturning(of("value"));

    await expect(
      firstValueFrom(interceptor.intercept(httpContext({}, {}, "rpc"), next))
    ).resolves.toBe("value");
    expect(log).not.toHaveBeenCalled();
  });

  it("logs the method, url and status of a successful call", async () => {
    const request = { method: "GET", originalUrl: "/api/pizzas", ip: "127.0.0.1" };
    const context = httpContext(request, { statusCode: 200 });

    await firstValueFrom(interceptor.intercept(context, handlerReturning(of("ok"))));

    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({ method: "GET", url: "/api/pizzas", statusCode: 200 }),
      "HTTP"
    );
  });

  it("falls back to url when originalUrl is absent", async () => {
    const context = httpContext({ method: "GET", url: "/api" }, { statusCode: 200 });

    await firstValueFrom(interceptor.intercept(context, handlerReturning(of("ok"))));

    expect(log).toHaveBeenCalledWith(expect.objectContaining({ url: "/api" }), "HTTP");
  });

  it("records who made the call when a token was present", async () => {
    const request = { method: "GET", url: "/api", user: { sub: "u1" } };

    await firstValueFrom(
      interceptor.intercept(httpContext(request, { statusCode: 200 }), handlerReturning(of("ok")))
    );

    expect(log).toHaveBeenCalledWith(expect.objectContaining({ userId: "u1" }), "HTTP");
  });

  describe("when the handler fails", () => {
    it("logs the status of the exception and re-raises it", async () => {
      const request: { method: string; url: string; errorLogged?: boolean } = {
        method: "GET",
        url: "/api/pizzas/1",
      };
      const context = httpContext(request, { statusCode: 200 });
      const next = handlerReturning(throwError(() => new NotFoundException("Pizza not found")));

      await expect(firstValueFrom(interceptor.intercept(context, next))).rejects.toThrow(
        NotFoundException
      );

      expect(error).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, errorMessage: "Pizza not found" }),
        expect.any(String),
        "HTTP"
      );
    });

    it("treats anything that is not an HttpException as a 500", async () => {
      const context = httpContext({ method: "GET", url: "/api" }, { statusCode: 200 });
      const next = handlerReturning(throwError(() => new TypeError("boom")));

      await expect(firstValueFrom(interceptor.intercept(context, next))).rejects.toThrow(TypeError);

      expect(error).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 500 }),
        expect.any(String),
        "HTTP"
      );
    });

    it("marks the request as already logged", async () => {
      const request: { method: string; url: string; errorLogged?: boolean } = {
        method: "GET",
        url: "/api",
      };
      const next = handlerReturning(throwError(() => new Error("boom")));

      await expect(
        firstValueFrom(interceptor.intercept(httpContext(request, { statusCode: 200 }), next))
      ).rejects.toThrow();

      expect(request.errorLogged).toBe(true);
    });
  });
});

describe("RmqLoggerService", () => {
  let emit: jest.Mock<(pattern: string, data: unknown) => unknown>;
  let logger: RmqLoggerService;

  function lastPayload(): LogWrittenEvent {
    const call = emit.mock.calls.at(-1);
    if (!call) throw new Error("nothing was published");
    return call[1] as LogWrittenEvent;
  }

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    emit = jest.fn<(pattern: string, data: unknown) => unknown>();
    logger = new RmqLoggerService({ emit } as unknown as ClientProxy);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("publishes an info entry for a plain message", () => {
    logger.log("Pizza created", "PizzasService");

    expect(emit).toHaveBeenCalledWith(EVENTS.logWritten, expect.anything());
    expect(lastPayload()).toMatchObject({
      level: LogLevel.INFO,
      message: "Pizza created",
      context: "PizzasService",
    });
  });

  it("publishes an error entry", () => {
    logger.error("Something broke", "stack\nline", "PizzasService");

    expect(lastPayload()).toMatchObject({ level: LogLevel.ERROR, message: "Something broke" });
  });

  it("takes the multi-line parameter as the stack and the single-line one as the context", () => {
    logger.error("boom", "at foo\n  at bar", "PizzasService");

    const payload = lastPayload();
    expect(payload.trace).toBe("at foo\n  at bar");
    expect(payload.context).toBe("PizzasService");
  });

  it("takes the message and stack from an Error", () => {
    logger.error(new Error("real failure"));

    const payload = lastPayload();
    expect(payload.message).toBe("real failure");
    expect(payload.trace).toContain("real failure");
  });

  it("splits an object into its message and metadata", () => {
    logger.log({ message: "[GET] /api 200", method: "GET", statusCode: 200 }, "HTTP");

    const payload = lastPayload();
    expect(payload.message).toBe("[GET] /api 200");
    expect(payload.metadata).toEqual({ method: "GET", statusCode: 200 });
  });

  it("leaves metadata unset when the object holds nothing else", () => {
    logger.log({ message: "only a message" });

    expect(lastPayload().metadata).toBeUndefined();
  });

  it("serialises an object without a message", () => {
    logger.log({ some: "thing" });

    expect(lastPayload().message).toBe('{"some":"thing"}');
  });

  it.each([
    ["a number", 42, "42"],
    ["a boolean", true, "true"],
  ])("stringifies %s", (_label, value, expected) => {
    logger.log(value);

    expect(lastPayload().message).toBe(expected);
  });

  it("stamps the entry with the service name and an ISO timestamp", () => {
    logger.log("hello");

    const payload = lastPayload();
    expect(typeof payload.service).toBe("string");
    expect(() => new Date(payload.timestamp).toISOString()).not.toThrow();
  });

  it("prints without publishing when no client was injected", () => {
    const standalone = new RmqLoggerService();

    expect(() => standalone.log("hello")).not.toThrow();
    expect(emit).not.toHaveBeenCalled();
  });

  it("survives a broker that refuses the entry", () => {
    const write = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
    emit.mockImplementation(() => {
      throw new Error("broker down");
    });

    expect(() => logger.log("hello")).not.toThrow();
    expect(write).toHaveBeenCalledWith(expect.stringContaining("Failed to publish"));
  });
});
