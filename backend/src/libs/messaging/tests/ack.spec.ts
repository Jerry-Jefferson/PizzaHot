import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Logger } from "@nestjs/common";
import type { RmqContext } from "@nestjs/microservices";
import { ack } from "../ack.ts";

describe("ack", () => {
  const message = { fields: { deliveryTag: 1 } };
  let channel: { ack: jest.Mock; nack: jest.Mock };
  let context: RmqContext;
  let logger: Logger;

  beforeEach(() => {
    channel = { ack: jest.fn(), nack: jest.fn() };
    context = {
      getChannelRef: () => channel,
      getMessage: () => message,
    } as unknown as RmqContext;
    logger = { error: jest.fn() } as unknown as Logger;
  });

  it("acknowledges the message once the handler is done", async () => {
    const handler = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);

    await ack(context, logger, "pizza.created", handler);

    expect(handler).toHaveBeenCalled();
    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it("nacks without requeue when the handler throws", async () => {
    const handler = jest.fn<() => Promise<void>>().mockRejectedValue(new Error("bad payload"));

    await ack(context, logger, "pizza.created", handler);

    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).toHaveBeenCalledWith(message, false, false);
  });

  it("does not let the failure escape to the caller", async () => {
    const handler = jest.fn<() => Promise<void>>().mockRejectedValue(new Error("bad payload"));

    await expect(ack(context, logger, "pizza.created", handler)).resolves.toBeUndefined();
  });

  it("logs the pattern that failed", async () => {
    const handler = jest.fn<() => Promise<void>>().mockRejectedValue(new Error("bad payload"));

    await ack(context, logger, "order.created", handler);

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("order.created"),
      expect.any(String)
    );
  });

  it("copes with something thrown that has no stack", async () => {
    const handler = jest.fn<() => Promise<void>>().mockRejectedValue("just a string");

    await ack(context, logger, "order.failed", handler);

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("order.failed"), undefined);
    expect(channel.nack).toHaveBeenCalled();
  });
});
