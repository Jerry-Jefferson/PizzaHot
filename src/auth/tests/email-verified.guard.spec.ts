import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { EmailVerifiedGuard } from "../guards/email-verified.guard.ts";
import type { UsersService } from "../../users/users.service.ts";
import type { JwtPayload } from "../types/jwt-payload.interface.ts";
import { Role } from "../../shared/constants/role.enum.ts";
import type { User } from "../../users/entities/user.entity.ts";

describe("EmailVerifiedGuard", () => {
  let guard: EmailVerifiedGuard;
  let mockUsersService: {
    findById: jest.Mock<(id: string) => Promise<Partial<User>>>;
  };

  const createMockContext = (user?: JwtPayload): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    mockUsersService = {
      findById: jest.fn(),
    };
    guard = new EmailVerifiedGuard(mockUsersService as unknown as UsersService);
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
    expect(mockUsersService.findById).not.toHaveBeenCalled();
  });

  it("should check database and allow access if token is false but user is verified in DB", async () => {
    const user: JwtPayload = {
      sub: "user-123",
      email: "test@example.com",
      role: Role.USER,
      isEmailVerified: false,
    };
    const context = createMockContext(user);

    mockUsersService.findById.mockResolvedValue({
      id: "user-123",
      isEmailVerified: true,
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(user.isEmailVerified).toBe(true);
    expect(mockUsersService.findById).toHaveBeenCalledWith("user-123");
  });

  it("should throw ForbiddenException if user is not verified in DB either", async () => {
    const user: JwtPayload = {
      sub: "user-123",
      email: "test@example.com",
      role: Role.USER,
      isEmailVerified: false,
    };
    const context = createMockContext(user);

    mockUsersService.findById.mockResolvedValue({
      id: "user-123",
      isEmailVerified: false,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
