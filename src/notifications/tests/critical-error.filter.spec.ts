import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CriticalErrorFilter } from "../filters/critical-error.filter.ts";
import { NotificationType } from "../constants/notification-type.constant.ts";
import type { NotificationsService } from "../notifications.service.ts";

describe("CriticalErrorFilter", () => {
  let filter: CriticalErrorFilter;
  let mockNotificationsService: { send: jest.Mock };
  let mockConfigService: { get: jest.Mock };
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: { url: string };
  let mockHost: { switchToHttp: jest.Mock };

  beforeEach(() => {
    mockNotificationsService = {
      send: jest.fn().mockResolvedValue(undefined as never),
    };
    mockConfigService = {
      get: jest.fn().mockReturnValue("admin@pizzahot.local"),
    };
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

    filter = new CriticalErrorFilter(
      mockNotificationsService as unknown as NotificationsService,
      mockConfigService as unknown as ConfigService
    );
  });

  it("should trigger email notification for 4xx errors (BadRequestException 400)", () => {
    const exception = new BadRequestException("Invalid input");

    filter.catch(exception, mockHost as never);

    expect(mockNotificationsService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.CRITICAL_ERROR,
        recipient: "admin@pizzahot.local",
        data: expect.objectContaining({
          statusCode: 400,
          path: "/api/test",
          message: "Invalid input",
        }),
      })
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it("should trigger email notification for 404 NotFoundException", () => {
    const exception = new NotFoundException("Resource not found");

    filter.catch(exception, mockHost as never);

    expect(mockNotificationsService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.CRITICAL_ERROR,
        recipient: "admin@pizzahot.local",
        data: expect.objectContaining({
          statusCode: 404,
          path: "/api/test",
        }),
      })
    );
    expect(mockResponse.status).toHaveBeenCalledWith(404);
  });

  it("should NOT trigger email notification for 5xx errors per user specification", () => {
    const exception = new InternalServerErrorException("Database failure");

    filter.catch(exception, mockHost as never);

    expect(mockNotificationsService.send).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });

  it("should NOT trigger email notification for unhandled generic Error (500)", () => {
    const exception = new Error("Unexpected crash");

    filter.catch(exception, mockHost as never);

    expect(mockNotificationsService.send).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });
});
