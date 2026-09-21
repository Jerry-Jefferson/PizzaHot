import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { EmailChannel } from "../email/email.channel.ts";
import { NotificationType } from "../../../libs/contracts/index.ts";
import { NotificationChannel } from "../notification-channel.constant.ts";
import type { EmailService } from "../email/email.service.ts";

describe("EmailChannel", () => {
  let channel: EmailChannel;
  let mockEmailService: { sendMail: jest.Mock<EmailService["sendMail"]> };
  let mockConfigService: { get: jest.Mock<(key: string) => string | undefined> };

  beforeEach(() => {
    mockEmailService = {
      sendMail: jest.fn<EmailService["sendMail"]>(),
    };
    mockConfigService = {
      get: jest.fn<(key: string) => string | undefined>().mockImplementation((key) => {
        if (key === "FRONTEND_URL") return "http://localhost:3000";
        if (key === "BACKEND_URL") return "http://localhost:3000";
        return undefined;
      }),
    };

    channel = new EmailChannel(mockEmailService, mockConfigService);
  });

  it("should have channel identifier set to EMAIL", () => {
    expect(channel.channel).toBe(NotificationChannel.EMAIL);
  });

  describe("supports", () => {
    it("should return true for all supported notification types", () => {
      expect(channel.supports(NotificationType.ACCOUNT_REGISTERED)).toBe(true);
      expect(channel.supports(NotificationType.ACCOUNT_DELETED)).toBe(true);
      expect(channel.supports(NotificationType.EMAIL_VERIFICATION)).toBe(true);
      expect(channel.supports(NotificationType.CRITICAL_ERROR)).toBe(true);
    });

    it("should return false for unsupported notification types", () => {
      expect(channel.supports("UNKNOWN_TYPE" as NotificationType)).toBe(false);
      expect(channel.supports("SMS_OTP" as NotificationType)).toBe(false);
    });
  });

  describe("send", () => {
    it("should send email for supported notification type with template", async () => {
      await channel.send({
        type: NotificationType.ACCOUNT_REGISTERED,
        recipient: "user@example.com",
        data: { name: "Alice" },
      });

      expect(mockEmailService.sendMail).toHaveBeenCalledWith(
        "user@example.com",
        expect.any(String),
        expect.stringContaining("Alice")
      );
    });

    it("should not call sendMail if template is not found for notification type", async () => {
      await channel.send({
        type: "UNSUPPORTED_TYPE" as NotificationType,
        recipient: "user@example.com",
      });

      expect(mockEmailService.sendMail).not.toHaveBeenCalled();
    });
  });
});
