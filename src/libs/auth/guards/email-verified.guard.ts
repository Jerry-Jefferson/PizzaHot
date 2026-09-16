import {
  CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { IDENTITY_CLIENT } from "../../messaging/tokens.ts";
import { RPC } from "../../contracts/patterns.ts";
import { rpc } from "../../messaging/rpc.util.ts";
import { JwtPayload } from "../jwt-payload.interface.ts";

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  private readonly logger = new Logger(EmailVerifiedGuard.name);

  constructor(
    @Inject(IDENTITY_CLIENT)
    private readonly identityClient: ClientProxy
  ) {}

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
        const dbUser = await rpc<{ isEmailVerified?: boolean } | null>(
          this.identityClient,
          RPC.identity.findById,
          { id: user.sub }
        );

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
