import { Controller, Post, Headers, UseGuards, HttpCode, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { BillingService } from "./billing.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Billing")
@Controller("billing")
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post("checkout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async checkout(@CurrentUser() user: { id: string; email: string }) {
    return this.billingService.createCheckoutSession(user.id, user.email);
  }

  @Post("portal")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async portal(@CurrentUser() user: { id: string }) {
    return this.billingService.createPortalSession(user.id);
  }

  @Post("webhook")
  @HttpCode(200)
  async webhook(
    @Req() req: any,
    @Headers("x-signature") signature: string,
  ) {
    const body = req.rawBody || req.body;
    return this.billingService.handleWebhook(
      Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body)),
      signature,
    );
  }
}
