import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { NotificationsService } from "../notifications.service.ts";
import { NotificationType } from "../constants/notification-type.constant.ts";
import { NotificationChannel } from "../constants/notification-channel.constant.ts";
import type { NotificationChannelHandler } from "../interfaces/notification-channel.interface.ts";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let mockEmailChannel: {
    channel: NotificationChannel;
    supports: jest.Mock;
    send: jest.Mock;
  };

  beforeEach(() => {
    mockEmailChannel = {
      channel: NotificationChannel.EMAIL,
      supports: jest.fn().mockReturnValue(true),
      send: jest.fn().mockResolvedValue(undefined as never),
    };

    service = new NotificationsService([mockEmailChannel as unknown as NotificationChannelHandler]);
  });

  it("should send notification to supported channels", async () => {
    await service.send({
      type: NotificationType.ACCOUNT_REGISTERED,
      recipient: "test@example.com",
      data: { name: "John" },
    });

    expect(mockEmailChannel.supports).toHaveBeenCalledWith(NotificationType.ACCOUNT_REGISTERED);
    expect(mockEmailChannel.send).toHaveBeenCalledWith({
      type: NotificationType.ACCOUNT_REGISTERED,
      recipient: "test@example.com",
      data: { name: "John" },
    });
  });

  it("should send EMAIL_VERIFICATION notification with verification data", async () => {
    await service.send({
      type: NotificationType.EMAIL_VERIFICATION,
      recipient: "test@example.com",
      data: {
        verificationToken: "sample-token-123",
        email: "test@example.com",
        name: "John",
      },
    });

    expect(mockEmailChannel.supports).toHaveBeenCalledWith(NotificationType.EMAIL_VERIFICATION);
    expect(mockEmailChannel.send).toHaveBeenCalledWith({
      type: NotificationType.EMAIL_VERIFICATION,
      recipient: "test@example.com",
      data: {
        verificationToken: "sample-token-123",
        email: "test@example.com",
        name: "John",
      },
    });
  });

  it("should not throw when a channel throws (failure isolation)", async () => {
    mockEmailChannel.send.mockRejectedValueOnce(new Error("SMTP connection refused") as never);

    await expect(
      service.send({
        type: NotificationType.ACCOUNT_REGISTERED,
        recipient: "test@example.com",
      })
    ).resolves.not.toThrow();
  });

  it("should skip unsupported channels", async () => {
    mockEmailChannel.supports.mockReturnValue(false);

    await service.send({
      type: NotificationType.CRITICAL_ERROR,
      recipient: "admin@example.com",
    });

    expect(mockEmailChannel.send).not.toHaveBeenCalled();
  });

  it("should dispatch to all channels that support the notification type", async () => {
    const mockInAppChannel = {
      channel: NotificationChannel.IN_APP,
      supports: jest.fn().mockReturnValue(true),
      send: jest.fn().mockResolvedValue(undefined as never),
    };

    const multiChannelService = new NotificationsService([
      mockEmailChannel as unknown as NotificationChannelHandler,
      mockInAppChannel as unknown as NotificationChannelHandler,
    ]);

    await multiChannelService.send({
      type: NotificationType.ACCOUNT_REGISTERED,
      recipient: "test@example.com",
    });

    expect(mockEmailChannel.send).toHaveBeenCalledWith({
      type: NotificationType.ACCOUNT_REGISTERED,
      recipient: "test@example.com",
    });
    expect(mockInAppChannel.send).toHaveBeenCalledWith({
      type: NotificationType.ACCOUNT_REGISTERED,
      recipient: "test@example.com",
    });
  });
});
