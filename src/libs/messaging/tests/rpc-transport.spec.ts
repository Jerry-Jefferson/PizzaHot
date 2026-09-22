import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  type CallHandler,
  type ExecutionContext,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { firstValueFrom, of, throwError, type Observable } from "rxjs";
import { RpcAckInterceptor } from "../rpc-ack.interceptor.ts";
import { RpcExceptionFilter } from "../rpc-exception.filter.ts";

function rpcContext(message: unknown, channel: { ack: jest.Mock }, type = "rpc"): ExecutionContext {
  return {
    getType: () => type,
    switchToRpc: () => ({
      getContext: () => ({ getMessage: () => message, getChannelRef: () => channel }),
    }),
  } as unknown as ExecutionContext;
}

function handlerReturning(stream: Observable<unknown>): CallHandler {
  return { handle: () => stream } as CallHandler;
}

describe("RpcAckInterceptor", () => {
  let channel: { ack: jest.Mock };

  beforeEach(() => {
    channel = { ack: jest.fn() };
  });

  it("leaves an http call alone", async () => {
    const context = rpcContext(undefined, channel, "http");

    await expect(
      firstValueFrom(new RpcAckInterceptor().intercept(context, handlerReturning(of("ok"))))
    ).resolves.toBe("ok");
    expect(channel.ack).not.toHaveBeenCalled();
  });

  it("leaves a message with no replyTo to its own handler", async () => {
    const context = rpcContext({ properties: {} }, channel);

    await firstValueFrom(new RpcAckInterceptor().intercept(context, handlerReturning(of("ok"))));

    expect(channel.ack).not.toHaveBeenCalled();
  });

  it("acknowledges a request once the handler answers", async () => {
    const message = { properties: { replyTo: "amq.rabbitmq.reply-to" } };
    const context = rpcContext(message, channel);

    await firstValueFrom(new RpcAckInterceptor().intercept(context, handlerReturning(of("ok"))));

    expect(channel.ack).toHaveBeenCalledWith(message);
  });

  it("acknowledges a request whose handler failed", async () => {
    const message = { properties: { replyTo: "reply" } };
    const context = rpcContext(message, channel);
    const next = handlerReturning(throwError(() => new Error("handler blew up")));

    await expect(firstValueFrom(new RpcAckInterceptor().intercept(context, next))).rejects.toThrow(
      "handler blew up"
    );

    expect(channel.ack).toHaveBeenCalledWith(message);
  });

  it("does not let a failing ack break the answer", async () => {
    channel.ack.mockImplementation(() => {
      throw new Error("channel closed");
    });
    const context = rpcContext({ properties: { replyTo: "reply" } }, channel);

    await expect(
      firstValueFrom(new RpcAckInterceptor().intercept(context, handlerReturning(of("ok"))))
    ).resolves.toBe("ok");
  });
});

describe("RpcExceptionFilter", () => {
  it("serialises a domain error so the caller can restore its status", async () => {
    const stream = new RpcExceptionFilter().catch(new NotFoundException("Pizza not found"));

    await expect(firstValueFrom(stream)).rejects.toMatchObject({
      __rpc: true,
      status: HttpStatus.NOT_FOUND,
      message: "Pizza not found",
    });
  });

  it("hides the detail of an unexpected failure", async () => {
    const stream = new RpcExceptionFilter().catch(new TypeError("cannot read x of undefined"));

    await expect(firstValueFrom(stream)).rejects.toMatchObject({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  });

  it("copes with something thrown that is not an Error", async () => {
    const stream = new RpcExceptionFilter().catch({ weird: true });

    await expect(firstValueFrom(stream)).rejects.toMatchObject({ error: "UnknownError" });
  });
});
