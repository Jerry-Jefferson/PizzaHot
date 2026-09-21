import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { COOKIE_NAME, IS_PUBLIC_KEY } from "../auth.constants.ts";
import { jwtPayloadSchema, type JwtPayload } from "../jwt-payload.schema.ts";

interface AppRequest {
  headers: { authorization?: string };
  cookies?: Record<string, string>;
  user?: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AppRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("Missing authentication token");
    }

    let claims: object;
    try {
      claims = await this.jwtService.verifyAsync<object>(token);
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    // A valid signature says the token is ours, not that its claims still match the
    // shape this code expects - tokens issued before a change stay valid until expiry.
    const parsed = jwtPayloadSchema.safeParse(claims);

    if (!parsed.success) {
      // Claim values can carry personal data, so only the failing field names are logged.
      const fields = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
      this.logger.warn(`Rejected a token whose claims do not match the expected shape: ${fields}`);
      throw new UnauthorizedException("Token claims are not recognised");
    }

    request.user = parsed.data;

    return true;
  }

  private extractToken(request: AppRequest): string | undefined {
    return this.extractTokenFromCookie(request) ?? this.extractTokenFromHeader(request);
  }

  private extractTokenFromCookie(request: AppRequest): string | undefined {
    return request.cookies?.[COOKIE_NAME];
  }

  private extractTokenFromHeader(request: AppRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
