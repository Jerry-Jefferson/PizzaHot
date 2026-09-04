import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";

import { Reflector } from "@nestjs/core";
import { Role } from "../../shared/constants/role.enum.ts";
import { ROLES_KEY } from "../decorators/roles.decorator.ts";
import { JwtPayload } from "../types/jwt-payload.interface.ts";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("User is not authenticated");
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
