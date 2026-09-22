import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import type { ClientProxy } from "@nestjs/microservices";
import { AuthService } from "../auth/auth.service.ts";
import type { UsersService } from "../users/users.service.ts";
import type { User } from "../users/user.entity.ts";
import { Role } from "../../../libs/auth/auth.constant.ts";
import { Gender } from "../users/constants/gender.constant.ts";
import { EVENTS } from "../../../libs/contracts/index.ts";

function user(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    email: "anna@example.com",
    passwordHash: "$2b$10$hash",
    name: "Anna",
    surname: "Ivanova",
    gender: Gender.FEMALE,
    image: null,
    role: Role.USER,
    isEmailVerified: false,
    verificationToken: "raw-token",
    verificationTokenExpiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("AuthService", () => {
  let users: {
    create: jest.Mock<(dto: unknown) => Promise<User>>;
    findByEmail: jest.Mock<(email: string) => Promise<User | null>>;
    findById: jest.Mock<(id: string) => Promise<unknown>>;
    findByVerificationToken: jest.Mock<(token: string) => Promise<User | null>>;
    updateVerificationStatus: jest.Mock<(id: string, data: unknown) => Promise<void>>;
  };
  let jwt: { sign: jest.Mock<(payload: unknown) => string> };
  let events: { emit: jest.Mock<(pattern: string, data: unknown) => unknown> };
  let service: AuthService;

  beforeEach(() => {
    users = {
      create: jest.fn<(dto: unknown) => Promise<User>>().mockResolvedValue(user()),
      findByEmail: jest.fn<(email: string) => Promise<User | null>>().mockResolvedValue(null),
      findById: jest.fn<(id: string) => Promise<unknown>>(),
      findByVerificationToken: jest
        .fn<(token: string) => Promise<User | null>>()
        .mockResolvedValue(user()),
      updateVerificationStatus: jest
        .fn<(id: string, data: unknown) => Promise<void>>()
        .mockResolvedValue(undefined),
    };
    jwt = { sign: jest.fn<(payload: unknown) => string>().mockReturnValue("signed.jwt.token") };
    events = { emit: jest.fn<(pattern: string, data: unknown) => unknown>() };

    service = new AuthService(
      users as unknown as UsersService,
      jwt as unknown as JwtService,
      events as unknown as ClientProxy
    );
  });

  describe("register", () => {
    it("creates the account unverified with a verification token", async () => {
      await service.register({ email: "anna@example.com", password: "Str0ng!" });

      expect(users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "anna@example.com",
          isEmailVerified: false,
          verificationToken: expect.any(String),
          verificationTokenExpiresAt: expect.any(Date),
        })
      );
    });

    it("signs a token carrying the claims the guards rely on", async () => {
      const result = await service.register({ email: "anna@example.com", password: "Str0ng!" });

      expect(jwt.sign).toHaveBeenCalledWith({
        sub: "u1",
        email: "anna@example.com",
        role: Role.USER,
        isEmailVerified: false,
      });
      expect(result.token).toBe("signed.jwt.token");
    });

    it("announces the registration so the email can be sent", async () => {
      await service.register({ email: "anna@example.com", password: "Str0ng!" });

      expect(events.emit).toHaveBeenCalledWith(
        EVENTS.userRegistered,
        expect.objectContaining({ userId: "u1", email: "anna@example.com" })
      );
    });

    it("does not return the password hash", async () => {
      const result = await service.register({ email: "anna@example.com", password: "Str0ng!" });

      expect(result.user).not.toHaveProperty("passwordHash");
      expect(result.user).not.toHaveProperty("verificationToken");
    });

    it("still registers when the broker refuses the event", async () => {
      events.emit.mockImplementation(() => {
        throw new Error("broker down");
      });

      await expect(
        service.register({ email: "anna@example.com", password: "Str0ng!" })
      ).resolves.toMatchObject({ token: "signed.jwt.token" });
    });
  });

  describe("login", () => {
    it("returns a token when the password matches", async () => {
      const hash = await bcrypt.hash("Str0ng!", 10);
      users.findByEmail.mockResolvedValue(user({ passwordHash: hash }));

      await expect(
        service.login({ email: "anna@example.com", password: "Str0ng!" })
      ).resolves.toMatchObject({ token: "signed.jwt.token" });
    });

    it("gives the same answer for an unknown email and a wrong password", async () => {
      users.findByEmail.mockResolvedValue(null);
      const unknownEmail = service
        .login({ email: "nobody@example.com", password: "x" })
        .catch((error: Error) => error.message);

      const hash = await bcrypt.hash("Str0ng!", 10);
      users.findByEmail.mockResolvedValue(user({ passwordHash: hash }));
      const wrongPassword = service
        .login({ email: "anna@example.com", password: "wrong" })
        .catch((error: Error) => error.message);

      expect(await unknownEmail).toBe("Invalid email or password");
      expect(await wrongPassword).toBe("Invalid email or password");
    });

    it("throws Unauthorized rather than NotFound", async () => {
      users.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: "n@example.com", password: "x" })).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe("validateVerificationToken", () => {
    it.each([
      ["an empty string", ""],
      ["only spaces", "   "],
    ])("refuses %s", async (_label, token) => {
      await expect(service.validateVerificationToken(token)).rejects.toThrow(BadRequestException);
      expect(users.findByVerificationToken).not.toHaveBeenCalled();
    });

    it("refuses a token no user holds", async () => {
      users.findByVerificationToken.mockResolvedValue(null);

      await expect(service.validateVerificationToken("nope")).rejects.toThrow(BadRequestException);
    });

    it("clears an expired token and refuses it", async () => {
      users.findByVerificationToken.mockResolvedValue(
        user({ verificationTokenExpiresAt: new Date(Date.now() - 60_000) })
      );

      await expect(service.validateVerificationToken("stale")).rejects.toThrow(BadRequestException);
      expect(users.updateVerificationStatus).toHaveBeenCalledWith("u1", {
        verificationToken: null,
        verificationTokenExpiresAt: null,
      });
    });

    it("accepts a token still in date", async () => {
      await expect(service.validateVerificationToken("raw-token")).resolves.toMatchObject({
        id: "u1",
      });
    });
  });

  describe("verifyEmailAccept", () => {
    it("marks the address verified and burns the token", async () => {
      await expect(service.verifyEmailAccept("raw-token")).resolves.toEqual({
        message: "Email successfully verified",
      });

      expect(users.updateVerificationStatus).toHaveBeenCalledWith("u1", {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      });
    });
  });

  describe("verifyEmailDecline", () => {
    it("leaves the address unverified and burns the token", async () => {
      await expect(service.verifyEmailDecline("raw-token")).resolves.toEqual({
        message: "Email verification request declined",
      });

      expect(users.updateVerificationStatus).toHaveBeenCalledWith("u1", {
        isEmailVerified: false,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      });
    });
  });

  describe("getProfile", () => {
    it("delegates to the users service", async () => {
      await service.getProfile("u1");

      expect(users.findById).toHaveBeenCalledWith("u1");
    });
  });
});
