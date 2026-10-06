import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { isAiEnabled } from "../config/limits";

/**
 * Global AI kill-switch. Runs before any controller logic, so a disabled
 * AI stack never consumes a user's or guest's daily credit.
 */
@Injectable()
export class AiEnabledGuard implements CanActivate {
  canActivate(): boolean {
    if (isAiEnabled()) return true;
    throw new ServiceUnavailableException({
      error: "AI is temporarily disabled. Please try again shortly.",
      code: "AI_DISABLED",
    });
  }
}
