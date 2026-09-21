import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/can.decorator.ts";
import { Permission, ROLE_PERMISSIONS } from "../permission.constant.ts";
import { JwtPayload } from "../jwt-payload.schema.ts";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("User is not authenticated");
    }

    const granted = ROLE_PERMISSIONS[user.role] ?? [];

    if (!required.some((permission) => granted.includes(permission))) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
