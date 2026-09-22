import { describe, it, expect } from "@jest/globals";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PermissionsGuard } from "../guards/permissions.guard.ts";
import { Permission, ROLE_PERMISSIONS } from "../permission.constant.ts";
import { Role, ROLES } from "../auth.constant.ts";
import type { JwtPayload } from "../jwt-payload.schema.ts";

function contextFor(user: JwtPayload | undefined): ExecutionContext {
  return {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

function payload(role: Role): JwtPayload {
  return {
    sub: "00000000-0000-0000-0000-000000000000",
    email: "someone@example.com",
    role,
    isEmailVerified: true,
  };
}

function guardRequiring(required: Permission[] | undefined): PermissionsGuard {
  const reflector = { getAllAndOverride: () => required } as unknown as Reflector;
  return new PermissionsGuard(reflector);
}

describe("PermissionsGuard", () => {
  it("lets an endpoint without @Can through untouched", () => {
    expect(guardRequiring(undefined).canActivate(contextFor(payload(Role.USER)))).toBe(true);
    expect(guardRequiring([]).canActivate(contextFor(payload(Role.USER)))).toBe(true);
  });

  it("allows a role that holds the permission", () => {
    const guard = guardRequiring([Permission.CART_MANAGE]);
    expect(guard.canActivate(contextFor(payload(Role.USER)))).toBe(true);
  });

  it("refuses a role that does not", () => {
    const guard = guardRequiring([Permission.LOG_READ]);
    expect(() => guard.canActivate(contextFor(payload(Role.USER)))).toThrow(ForbiddenException);
  });

  it("refuses when nothing was authenticated", () => {
    const guard = guardRequiring([Permission.CART_MANAGE]);
    expect(() => guard.canActivate(contextFor(undefined))).toThrow(ForbiddenException);
  });

  it("treats several permissions as any-of", () => {
    const guard = guardRequiring([Permission.LOG_READ, Permission.CART_MANAGE]);
    expect(guard.canActivate(contextFor(payload(Role.USER)))).toBe(true);
  });
});

describe("ROLE_PERMISSIONS", () => {
  it("covers every role", () => {
    for (const role of ROLES) {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
    }
  });

  it("gives an admin everything a user has", () => {
    for (const permission of ROLE_PERMISSIONS[Role.USER]) {
      expect(ROLE_PERMISSIONS[Role.ADMIN]).toContain(permission);
    }
  });

  it("keeps reaching other people's data out of the customer role", () => {
    const adminOnly = [
      Permission.ORDER_READ_ANY,
      Permission.USER_READ_ANY,
      Permission.USER_ROLE_WRITE,
      Permission.LOG_READ,
      Permission.ANALYTICS_READ,
      Permission.PIZZA_DELETE,
    ];

    for (const permission of adminOnly) {
      expect(ROLE_PERMISSIONS[Role.USER]).not.toContain(permission);
    }
  });

  it("leaves no permission unused by every role", () => {
    const granted = new Set(ROLES.flatMap((role) => [...ROLE_PERMISSIONS[role]]));
    const declared = Object.values(Permission);

    expect([...declared].filter((permission) => !granted.has(permission))).toEqual([]);
  });
});
