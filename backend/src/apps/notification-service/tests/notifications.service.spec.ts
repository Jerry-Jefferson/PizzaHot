import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { NotificationsService } from "../notifications.service.ts";
import { NotificationType } from "../../../libs/contracts/index.ts";
import { NotificationChannel } from "../notification-channel.constant.ts";
import type { NotificationChannelHandler } from "../notification.types.ts";

type MockChannel = {
  channel: NotificationChannel;
  supports: jest.Mock<NotificationChannelHandler["supports"]>;
  send: jest.Mock<NotificationChannelHandler["send"]>;
};

describe("NotificationsService", () => {
  let service: NotificationsService;
  let mockEmailChannel: MockChannel;

  beforeEach(() => {
    mockEmailChannel = {
      channel: NotificationChannel.EMAIL,
      supports: jest.fn<NotificationChannelHandler["supports"]>().mockReturnValue(true),
      send: jest.fn<NotificationChannelHandler["send"]>(),
    };

    service = new NotificationsService([mockEmailChannel]);
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
    mockEmailChannel.send.mockRejectedValueOnce(new Error("SMTP connection refused"));

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
    const mockInAppChannel: MockChannel = {
      channel: NotificationChannel.IN_APP,
      supports: jest.fn<NotificationChannelHandler["supports"]>().mockReturnValue(true),
      send: jest.fn<NotificationChannelHandler["send"]>(),
    };

    const multiChannelService = new NotificationsService([mockEmailChannel, mockInAppChannel]);

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
