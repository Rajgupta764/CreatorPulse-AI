import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

/**
 * Resolves the user when a token is present, otherwise continues as a guest.
 * A present-but-invalid token is a hard 401 (never silently downgraded to
 * guest, otherwise a stale token would silently burn the guest quota).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException({ error: "Session expired" });
    }
    return user;
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return true;
    }
    return super.canActivate(context);
  }
}
