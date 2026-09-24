import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import {
  type ArgumentsHost,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import type { EventPublisher } from "../../../libs/messaging/message-client.types.ts";
import { createHttpExecutionContext } from "../../../libs/mocks/http-context.mock.ts";
import { CriticalErrorFilter } from "../../../libs/logging/critical-error.filter.ts";
import { EVENTS } from "../../../libs/contracts/index.ts";

describe("CriticalErrorFilter", () => {
  let filter: CriticalErrorFilter;
  let mockEvents: { emit: jest.Mock<EventPublisher["emit"]> };
  let mockResponse: { status: jest.Mock<(code: number) => typeof mockResponse>; json: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    mockEvents = { emit: jest.fn<EventPublisher["emit"]>() };
    mockResponse = {
      status: jest.fn<(code: number) => typeof mockResponse>(),
      json: jest.fn(),
    };
    mockResponse.status.mockReturnValue(mockResponse);

    mockHost = createHttpExecutionContext({ url: "/api/test" }, mockResponse);

    filter = new CriticalErrorFilter(mockEvents);
  });

  it("should trigger email notification for 5xx errors (InternalServerErrorException 500)", () => {
    const exception = new InternalServerErrorException("Database failure");

    filter.catch(exception, mockHost);

    expect(mockEvents.emit).toHaveBeenCalledWith(
      EVENTS.criticalError,
      expect.objectContaining({
        statusCode: 500,
        path: "/api/test",
        message: "Database failure",
      })
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });

  it("should trigger email notification for an unhandled generic Error (500)", () => {
    const exception = new Error("Unexpected crash");

    filter.catch(exception, mockHost);

    expect(mockEvents.emit).toHaveBeenCalledWith(
      EVENTS.criticalError,
      expect.objectContaining({
        statusCode: 500,
        path: "/api/test",
        message: "Unexpected crash",
      })
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });

  it("should NOT notify for 400 BadRequestException - a client mistake, not an outage", () => {
    const exception = new BadRequestException("Invalid input");

    filter.catch(exception, mockHost);

    expect(mockEvents.emit).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it("should NOT notify for 404 NotFoundException", () => {
    const exception = new NotFoundException("Resource not found");

    filter.catch(exception, mockHost);

    expect(mockEvents.emit).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(404);
  });
});
