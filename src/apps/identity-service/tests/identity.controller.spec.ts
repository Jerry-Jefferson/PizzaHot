import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { ClientProxy } from "@nestjs/microservices";
import { IdentityMessagesController } from "../identity.controller.ts";
import type { AuthService } from "../auth/auth.service.ts";
import type { UsersService } from "../users/users.service.ts";
import { EVENTS } from "../../../libs/contracts/index.ts";
import { Role } from "../../../libs/auth/auth.constant.ts";

describe("IdentityMessagesController", () => {
  let auth: Record<string, jest.Mock>;
  let users: Record<string, jest.Mock>;
  let events: { emit: jest.Mock<(pattern: string, data: unknown) => unknown> };
  let controller: IdentityMessagesController;

  beforeEach(() => {
    auth = {
      register: jest.fn<() => Promise<unknown>>().mockResolvedValue({ token: "t", user: {} }),
      login: jest.fn<() => Promise<unknown>>().mockResolvedValue({ token: "t", user: {} }),
      validateVerificationToken: jest
        .fn<() => Promise<unknown>>()
        .mockResolvedValue({ id: "u1", email: "anna@example.com" }),
      verifyEmailAccept: jest
        .fn<() => Promise<unknown>>()
        .mockResolvedValue({ message: "Email successfully verified" }),
      verifyEmailDecline: jest.fn<() => Promise<unknown>>().mockResolvedValue({ message: "no" }),
    };
    users = {
      findById: jest.fn<() => Promise<unknown>>().mockResolvedValue({ id: "u1" }),
      findAll: jest
        .fn<() => Promise<{ data: unknown[]; total: number }>>()
        .mockResolvedValue({ data: [{ id: "u1" }], total: 4 }),
      update: jest.fn<() => Promise<unknown>>().mockResolvedValue({ id: "u1" }),
      setImagePath: jest.fn<() => Promise<unknown>>().mockResolvedValue({ id: "u1" }),
      setRole: jest.fn<() => Promise<unknown>>().mockResolvedValue({ id: "u2" }),
      changePassword: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      remove: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };
    events = { emit: jest.fn<(pattern: string, data: unknown) => unknown>() };

    controller = new IdentityMessagesController(
      auth as unknown as AuthService,
      users as unknown as UsersService,
      events as unknown as ClientProxy
    );
  });

  it("delegates registration and login unchanged", async () => {
    await controller.register({ email: "a@b.c", password: "p" });
    await controller.login({ email: "a@b.c", password: "p" });

    expect(auth.register).toHaveBeenCalledWith({ email: "a@b.c", password: "p" });
    expect(auth.login).toHaveBeenCalledWith({ email: "a@b.c", password: "p" });
  });

  describe("verifyEmail", () => {
    it("announces the verification", async () => {
      await controller.verifyEmail({ token: "tok" });

      expect(events.emit).toHaveBeenCalledWith(EVENTS.userEmailVerified, {
        userId: "u1",
        email: "anna@example.com",
      });
    });

    it("reads the user before accepting", async () => {
      await controller.verifyEmail({ token: "tok" });

      const validateOrder = auth.validateVerificationToken.mock.invocationCallOrder[0];
      const acceptOrder = auth.verifyEmailAccept.mock.invocationCallOrder[0];
      expect(validateOrder).toBeLessThan(acceptOrder);
    });

    it("returns what the service answered", async () => {
      await expect(controller.verifyEmail({ token: "tok" })).resolves.toEqual({
        message: "Email successfully verified",
      });
    });
  });

  it("declines without announcing anything", async () => {
    await controller.declineEmail({ token: "tok" });

    expect(auth.verifyEmailDecline).toHaveBeenCalledWith("tok");
    expect(events.emit).not.toHaveBeenCalled();
  });

  describe("findAll", () => {
    it("builds the page the gateway forwards", async () => {
      const result = await controller.findAll({ page: 2, limit: 2 });

      expect(users.findAll).toHaveBeenCalledWith(2, 2, undefined);
      expect(result).toMatchObject({ page: 2, limit: 2, total: 4, totalPages: 2 });
    });

    it("defaults the page and limit", async () => {
      await controller.findAll({});

      expect(users.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  it("unwraps the payloads of the remaining handlers", async () => {
    await controller.findById({ id: "u1" });
    await controller.update({ userId: "u1", dto: { name: "Anna", surname: null, gender: null } });
    await controller.setImage({ userId: "u1", imagePath: "/uploads/users/a.png" });
    await controller.setRole({ id: "u2", role: Role.ADMIN, actingUserId: "u1" });

    expect(users.findById).toHaveBeenCalledWith("u1");
    expect(users.update).toHaveBeenCalledWith("u1", { name: "Anna", surname: null, gender: null });
    expect(users.setImagePath).toHaveBeenCalledWith("u1", "/uploads/users/a.png");
    expect(users.setRole).toHaveBeenCalledWith("u2", Role.ADMIN, "u1");
  });

  it("answers the write handlers with an acknowledgement object", async () => {
    await expect(
      controller.changePassword({ userId: "u1", dto: { currentPassword: "a", newPassword: "b" } })
    ).resolves.toEqual({ ok: true });
    await expect(controller.remove({ userId: "u1" })).resolves.toEqual({ ok: true });
  });
});
