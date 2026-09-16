import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { EmailVerifiedGuard } from "../../../../libs/auth/guards/email-verified.guard.ts";
import type { ClientProxy } from "@nestjs/microservices";
import { of } from "rxjs";
import type { JwtPayload } from "../../../../libs/auth/jwt-payload.interface.ts";
import { Role } from "../../../../libs/common/constants/role.enum.ts";
import { RPC } from "../../../../libs/contracts/patterns.ts";

describe("EmailVerifiedGuard", () => {
  let guard: EmailVerifiedGuard;
  let mockIdentityClient: { send: jest.Mock };

  const createMockContext = (user?: JwtPayload): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    mockIdentityClient = { send: jest.fn() };
    guard = new EmailVerifiedGuard(mockIdentityClient as unknown as ClientProxy);
  });

  it("should throw ForbiddenException if user is not authenticated", async () => {
    const context = createMockContext(undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it("should allow access immediately if user.isEmailVerified is true in token", async () => {
    const user: JwtPayload = {
      sub: "user-123",
      email: "test@example.com",
      role: Role.USER,
      isEmailVerified: true,
    };
    const context = createMockContext(user);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockIdentityClient.send).not.toHaveBeenCalled();
  });

  it("should check database and allow access if token is false but user is verified in DB", async () => {
    const user: JwtPayload = {
      sub: "user-123",
      email: "test@example.com",
      role: Role.USER,
      isEmailVerified: false,
    };
    const context = createMockContext(user);

    mockIdentityClient.send.mockReturnValue(
      of({
        id: "user-123",
        isEmailVerified: true,
      })
    );

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(user.isEmailVerified).toBe(true);
    expect(mockIdentityClient.send).toHaveBeenCalledWith(RPC.identity.findById, {
      id: "user-123",
    });
  });

  it("should throw ForbiddenException if user is not verified in DB either", async () => {
    const user: JwtPayload = {
      sub: "user-123",
      email: "test@example.com",
      role: Role.USER,
      isEmailVerified: false,
    };
    const context = createMockContext(user);

    mockIdentityClient.send.mockReturnValue(
      of({
        id: "user-123",
        isEmailVerified: false,
      })
    );

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
