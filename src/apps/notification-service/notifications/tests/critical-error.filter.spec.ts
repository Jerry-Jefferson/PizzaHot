import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { CriticalErrorFilter } from "../../../../libs/logging/critical-error.filter.ts";
import { EVENTS } from "../../../../libs/contracts/patterns.ts";

describe("CriticalErrorFilter", () => {
  let filter: CriticalErrorFilter;
  let mockEvents: { emit: jest.Mock };
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: { url: string };
  let mockHost: { switchToHttp: jest.Mock };

  beforeEach(() => {
    mockEvents = { emit: jest.fn() };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = { url: "/api/test" };
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    filter = new CriticalErrorFilter(mockEvents as unknown as ClientProxy);
  });

  it("should trigger email notification for 4xx errors (BadRequestException 400)", () => {
    const exception = new BadRequestException("Invalid input");

    filter.catch(exception, mockHost as never);

    expect(mockEvents.emit).toHaveBeenCalledWith(
      EVENTS.criticalError,
      expect.objectContaining({
        statusCode: 400,
        path: "/api/test",
        message: "Invalid input",
      })
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it("should trigger email notification for 404 NotFoundException", () => {
    const exception = new NotFoundException("Resource not found");

    filter.catch(exception, mockHost as never);

    expect(mockEvents.emit).toHaveBeenCalledWith(
      EVENTS.criticalError,
      expect.objectContaining({
        statusCode: 404,
        path: "/api/test",
      })
    );
    expect(mockResponse.status).toHaveBeenCalledWith(404);
  });

  it("should NOT trigger email notification for 5xx errors per user specification", () => {
    const exception = new InternalServerErrorException("Database failure");

    filter.catch(exception, mockHost as never);

    expect(mockEvents.emit).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });

  it("should NOT trigger email notification for unhandled generic Error (500)", () => {
    const exception = new Error("Unexpected crash");

    filter.catch(exception, mockHost as never);

    expect(mockEvents.emit).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });
});
