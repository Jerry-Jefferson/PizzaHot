import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

import { JwtPayload } from "../types/jwt-payload.interface.ts";

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("User is not authenticated");
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException("Email is not verified. Please verify your email first.");
    }

    return true;
  }
}
