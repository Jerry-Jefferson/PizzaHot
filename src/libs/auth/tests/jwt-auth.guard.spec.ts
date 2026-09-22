import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "../guards/jwt-auth.guard.ts";
import { COOKIE_NAME, Role } from "../auth.constant.ts";
import type { JwtPayload } from "../jwt-payload.schema.ts";

interface FakeRequest {
  headers: { authorization?: string };
  cookies?: Record<string, string>;
  user?: JwtPayload;
}

const VALID_CLAIMS = {
  sub: "11111111-1111-4111-8111-111111111111",
  email: "someone@example.com",
  role: Role.USER,
  isEmailVerified: true,
};

function contextFor(request: FakeRequest): ExecutionContext {
  return {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe("JwtAuthGuard", () => {
  let verifyAsync: jest.Mock<(token: string) => Promise<object>>;
  let guard: JwtAuthGuard;
  let isPublic: boolean;

  beforeEach(() => {
    isPublic = false;
    verifyAsync = jest.fn<(token: string) => Promise<object>>().mockResolvedValue(VALID_CLAIMS);

    const jwtService = { verifyAsync } as unknown as JwtService;
    const reflector = { getAllAndOverride: () => isPublic } as unknown as Reflector;

    guard = new JwtAuthGuard(jwtService, reflector);
  });

  it("lets a @Public endpoint through without looking for a token", async () => {
    isPublic = true;

    await expect(guard.canActivate(contextFor({ headers: {} }))).resolves.toBe(true);
    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it("reads the token from the Authorization header", async () => {
    const request: FakeRequest = { headers: { authorization: "Bearer header-token" } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(verifyAsync).toHaveBeenCalledWith("header-token");
    expect(request.user).toEqual(VALID_CLAIMS);
  });

  it("reads the token from the cookie", async () => {
    const request: FakeRequest = { headers: {}, cookies: { [COOKIE_NAME]: "cookie-token" } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(verifyAsync).toHaveBeenCalledWith("cookie-token");
  });

  it("prefers the cookie when both are present", async () => {
    const request: FakeRequest = {
      headers: { authorization: "Bearer header-token" },
      cookies: { [COOKIE_NAME]: "cookie-token" },
    };

    await guard.canActivate(contextFor(request));

    expect(verifyAsync).toHaveBeenCalledWith("cookie-token");
  });

  it("refuses when no token is supplied", async () => {
    await expect(guard.canActivate(contextFor({ headers: {} }))).rejects.toThrow(
      new UnauthorizedException("Missing authentication token")
    );
  });

  it("ignores an Authorization header with a different scheme", async () => {
    const request: FakeRequest = { headers: { authorization: "Basic abc123" } };

    await expect(guard.canActivate(contextFor(request))).rejects.toThrow(UnauthorizedException);
  });

  it("refuses a token the signature check rejects", async () => {
    verifyAsync.mockRejectedValue(new Error("jwt expired"));

    const request: FakeRequest = { headers: { authorization: "Bearer stale" } };

    await expect(guard.canActivate(contextFor(request))).rejects.toThrow(
      new UnauthorizedException("Invalid or expired token")
    );
  });

  it.each([
    ["a role outside the union", { ...VALID_CLAIMS, role: "superuser" }],
    ["a subject that is not a UUID", { ...VALID_CLAIMS, sub: "42" }],
    ["an email that is not an address", { ...VALID_CLAIMS, email: "not-an-email" }],
    [
      "a missing isEmailVerified",
      { sub: VALID_CLAIMS.sub, email: VALID_CLAIMS.email, role: Role.USER },
    ],
  ])("refuses a signed token with %s", async (_label, claims) => {
    verifyAsync.mockResolvedValue(claims);

    const request: FakeRequest = { headers: { authorization: "Bearer shaped-wrong" } };

    await expect(guard.canActivate(contextFor(request))).rejects.toThrow(
      new UnauthorizedException("Token claims are not recognised")
    );
    expect(request.user).toBeUndefined();
  });

  it("strips claims the schema does not declare", async () => {
    verifyAsync.mockResolvedValue({ ...VALID_CLAIMS, iat: 1, exp: 2, secret: "leak" });

    const request: FakeRequest = { headers: { authorization: "Bearer extra-claims" } };
    await guard.canActivate(contextFor(request));

    expect(request.user).toEqual(VALID_CLAIMS);
  });
});
