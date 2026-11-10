import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { Model } from "mongoose";
import { LogsService } from "../logs.service.ts";
import type { LogDocument } from "../schemas/log.schema.ts";
import type { ListLogsQuery } from "../schemas/log-query.schema.ts";
import type { LogWrittenEvent } from "../../../libs/contracts/index.ts";
import { LogLevel } from "../../../libs/logging/log-level.constant.ts";
import { LogMessagesController } from "../log.controller.ts";
import type { RmqContext } from "@nestjs/microservices";

function findChain(rows: unknown[]): Record<string, jest.Mock> {
  const chain: Record<string, jest.Mock> = {};
  for (const step of ["sort", "skip", "limit", "lean"]) {
    chain[step] = jest.fn(() => chain);
  }
  chain.exec = jest.fn<() => Promise<unknown[]>>().mockResolvedValue(rows);
  return chain;
}

describe("LogsService", () => {
  let model: {
    create: jest.Mock<(doc: unknown) => Promise<unknown>>;
    find: jest.Mock<(filter: unknown) => Record<string, jest.Mock>>;
    countDocuments: jest.Mock<(filter: unknown) => { exec: jest.Mock }>;
  };
  let chain: Record<string, jest.Mock>;
  let service: LogsService;

  beforeEach(() => {
    chain = findChain([{ message: "hello" }]);
    model = {
      create: jest.fn<(doc: unknown) => Promise<unknown>>().mockResolvedValue({ _id: "1" }),
      find: jest.fn(() => chain),
      countDocuments: jest.fn(() => ({
        exec: jest.fn<() => Promise<number>>().mockResolvedValue(42),
      })),
    };

    service = new LogsService(model as unknown as Model<LogDocument>);
  });

  describe("create", () => {
    it("stores the entry as given", async () => {
      const timestamp = new Date("2026-09-01T12:00:00.000Z");

      await service.create({
        level: LogLevel.ERROR,
        message: "boom",
        context: "PizzasService",
        timestamp,
      });

      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({ level: LogLevel.ERROR, message: "boom", timestamp })
      );
    });

    it("stamps the current time when none is given", async () => {
      await service.create({ level: LogLevel.INFO, message: "hello" });

      const doc = model.create.mock.calls[0][0] as { timestamp: Date };
      expect(doc.timestamp).toBeInstanceOf(Date);
    });

    it("swallows a database failure and returns null", async () => {
      model.create.mockRejectedValue(new Error("mongo down"));

      await expect(service.create({ level: LogLevel.INFO, message: "hello" })).resolves.toBeNull();
    });
  });

  describe("findAll", () => {
    const unvalidated = (query: Partial<ListLogsQuery>): ListLogsQuery => query as ListLogsQuery;

    it("pages the result", async () => {
      const result = await service.findAll({ page: 3, limit: 5 });

      expect(chain.skip).toHaveBeenCalledWith(10);
      expect(chain.limit).toHaveBeenCalledWith(5);
      expect(result).toMatchObject({ page: 3, limit: 5, total: 42 });
    });

    it("defaults to the first page of ten", async () => {
      await service.findAll(unvalidated({}));

      expect(chain.skip).toHaveBeenCalledWith(0);
      expect(chain.limit).toHaveBeenCalledWith(10);
    });

    it("sorts newest first", async () => {
      await service.findAll(unvalidated({}));

      expect(chain.sort).toHaveBeenCalledWith({ timestamp: -1 });
    });

    it("filters by level and context only when asked", async () => {
      await service.findAll(unvalidated({ level: LogLevel.ERROR, context: "PizzasService" }));
      expect(model.find).toHaveBeenLastCalledWith({
        level: LogLevel.ERROR,
        context: "PizzasService",
      });

      await service.findAll(unvalidated({}));
      expect(model.find).toHaveBeenLastCalledWith({});
    });

    it("counts with the same filter it reads with", async () => {
      await service.findAll(unvalidated({ level: LogLevel.ERROR }));

      expect(model.countDocuments).toHaveBeenCalledWith({ level: LogLevel.ERROR });
    });
  });
});

describe("LogMessagesController", () => {
  let logs: { create: jest.Mock; findAll: jest.Mock };
  let controller: LogMessagesController;
  let channel: { ack: jest.Mock; nack: jest.Mock };
  let context: RmqContext;

  beforeEach(() => {
    logs = {
      create: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
      findAll: jest.fn<() => Promise<unknown>>().mockResolvedValue({ data: [], total: 0 }),
    };
    channel = { ack: jest.fn(), nack: jest.fn() };
    context = { getChannelRef: () => channel, getMessage: () => ({}) } as unknown as RmqContext;

    controller = new LogMessagesController(logs as unknown as LogsService);
  });

  const asEvent = (event: Partial<LogWrittenEvent>): LogWrittenEvent => event as LogWrittenEvent;

  it("stores an incoming log line and acknowledges", async () => {
    await controller.onLogWritten(
      {
        level: "error",
        message: "boom",
        context: "PizzasService",
        service: "catalog-service",
        timestamp: "2026-09-01T12:00:00.000Z",
      },
      context
    );

    expect(logs.create).toHaveBeenCalledWith(
      expect.objectContaining({ level: "error", message: "boom" })
    );
    expect(channel.ack).toHaveBeenCalled();
  });

  it("keeps the sending service in the metadata", async () => {
    await controller.onLogWritten(
      asEvent({
        level: "info",
        message: "hi",
        service: "cart-service",
        metadata: { requestId: "r1" },
      }),
      context
    );

    const dto = logs.create.mock.calls[0][0] as { metadata: Record<string, unknown> };
    expect(dto.metadata).toEqual({ requestId: "r1", service: "cart-service" });
  });

  it("leaves the timestamp unset when the event carries none", async () => {
    await controller.onLogWritten(
      asEvent({ level: "info", message: "hi", service: "cart-service" }),
      context
    );

    const dto = logs.create.mock.calls[0][0] as { timestamp?: Date };
    expect(dto.timestamp).toBeUndefined();
  });

  it("passes a query straight to the service", async () => {
    await controller.findAll({ page: 1, limit: 10 });

    expect(logs.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });
});
