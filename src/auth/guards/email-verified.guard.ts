import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { UsersService } from "../../users/users.service.ts";
import { JwtPayload } from "../types/jwt-payload.interface.ts";

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  private readonly logger = new Logger(EmailVerifiedGuard.name);

  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException("User is not authenticated");
    }

    if (user.isEmailVerified) {
      return true;
    }

    if (user.sub) {
      try {
        const dbUser = await this.usersService.findById(user.sub);

        if (dbUser?.isEmailVerified) {
          user.isEmailVerified = true;
          return true;
        }
      } catch (error) {
        this.logger.error(
          `Failed to check email verification for user ${user.sub}`,
          error instanceof Error ? error.stack : String(error)
        );
      }
    }

    throw new ForbiddenException("Email is not verified. Please verify your email first.");
  }
}
