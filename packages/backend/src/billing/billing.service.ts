import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { dailyCreditsForTier, TIERS } from "../common/config/limits";
import * as crypto from "node:crypto";

const PLACEHOLDER_VALUES = new Set(["", "your_api_key_here", "your_variant_id", "your_webhook_secret"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isConfigured(value?: string): value is string {
  return !!value && !PLACEHOLDER_VALUES.has(value.trim());
}

function isNumericId(value?: string): boolean {
  return !!value && /^\d+$/.test(value.trim());
}

export function billingEnvIssues(): string[] {
  const issues: string[] = [];
  if (!isConfigured(process.env.LEMON_SQUEEZY_API_KEY)) issues.push("LEMON_SQUEEZY_API_KEY");
  if (!isNumericId(process.env.LEMON_SQUEEZY_STORE_ID)) issues.push("LEMON_SQUEEZY_STORE_ID (must be a numeric id)");
  if (!isNumericId(process.env.LEMON_SQUEEZY_VARIANT_ID)) issues.push("LEMON_SQUEEZY_VARIANT_ID (placeholder or not a numeric id)");
  if (!isConfigured(process.env.LEMON_SQUEEZY_WEBHOOK_SECRET)) issues.push("LEMON_SQUEEZY_WEBHOOK_SECRET");
  return issues;
}

function getApiKey() {
  const key = process.env.LEMON_SQUEEZY_API_KEY;
  if (!isConfigured(key)) return null;
  return key;
}

function getSiteUrl() {
  return process.env.SITE_URL || "http://localhost:3000";
}

async function lemonFetch(endpoint: string, opts: RequestInit = {}) {
  const apiKey = getApiKey();
  const res = await fetch(`https://api.lemonsqueezy.com/v1/${endpoint}`, {
    ...opts,
    headers: {
      "Accept": "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "Authorization": `Bearer ${apiKey}`,
      ...opts.headers as Record<string, string>,
    },
  });
  return res.json();
}

interface ActivateOptions {
  customerId?: string | number | null;
  subscriptionId?: string | number | null;
  status?: string;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createCheckoutSession(userId: string, email: string) {
    if (!getApiKey()) {
      return { error: "Lemon Squeezy is not configured yet. Please set LEMON_SQUEEZY_API_KEY in .env" };
    }

    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;

    if (!isNumericId(storeId)) {
      return { error: "LEMON_SQUEEZY_STORE_ID is missing or not a numeric id. Check your .env file." };
    }
    if (!isNumericId(variantId)) {
      return {
        error:
          "LEMON_SQUEEZY_VARIANT_ID is not set to a real variant. Copy it from Lemon Squeezy → Products → your variant → Pricing.",
      };
    }

    const siteUrl = getSiteUrl();

    const body = {
      data: {
        type: "checkouts",
        attributes: {
          product_options: {
            redirect_url: `${siteUrl}/billing`,
          },
          checkout_data: {
            email,
            custom: { user_id: userId },
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: storeId },
          },
          variant: {
            data: { type: "variants", id: variantId },
          },
        },
      },
    };

    let json: any;
    try {
      json = await lemonFetch("checkouts", {
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch (err: any) {
      this.logger.error(`Checkout request failed: ${err?.message || err}`);
      return { error: "Could not reach Lemon Squeezy. Please try again later." };
    }

    if (json.errors) {
      return { error: json.errors?.[0]?.detail || "Checkout creation failed" };
    }

    const url = json.data?.attributes?.url;
    if (!url) {
      return { error: "Lemon Squeezy did not return a checkout URL" };
    }
    return { url };
  }

  async createPortalSession(userId: string) {
    if (!getApiKey()) {
      return { error: "Lemon Squeezy is not configured yet. Please set LEMON_SQUEEZY_API_KEY in .env" };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lemonSubscriptionId: true },
    });

    if (!user?.lemonSubscriptionId) {
      return { error: "No active subscription found for this account." };
    }

    let json: any;
    try {
      json = await lemonFetch(`subscriptions/${user.lemonSubscriptionId}`);
    } catch (err: any) {
      this.logger.error(`Portal request failed: ${err?.message || err}`);
      return { error: "Could not reach Lemon Squeezy. Please try again later." };
    }

    const portalUrl = json?.data?.attributes?.urls?.customer_portal;
    if (!portalUrl) {
      return { error: "Could not load the subscription portal. Please contact support." };
    }
    return { url: portalUrl };
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<{ received: boolean }> {
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    if (!isConfigured(secret)) {
      this.logger.error("Webhook received but LEMON_SQUEEZY_WEBHOOK_SECRET is not configured — event discarded");
      throw new InternalServerErrorException({
        message: "Webhook secret not configured on the server",
      });
    }

    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const sig = Buffer.from(signature || "", "utf8");

    if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
      this.logger.warn("Webhook rejected: invalid signature");
      throw new UnauthorizedException({ message: "Invalid signature" });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      throw new InternalServerErrorException({ message: "Invalid JSON payload" });
    }

    const eventName: string = payload?.meta?.event_name || "unknown_event";
    const resourceType: string = payload?.data?.type || "";
    const resourceId: string | undefined = payload?.data?.id ? String(payload.data.id) : undefined;
    const attrs = payload?.data?.attributes || {};

    try {
      const userId = await this.resolveUserId(payload, resourceType, attrs);
      if (!userId) {
        this.logger.warn(`Webhook ${eventName}: no matching user found — ignored`);
        return { received: true };
      }
      await this.applyEvent(userId, eventName, { resourceType, resourceId, attrs });
      this.logger.log(`Webhook ${eventName} processed for user ${userId}`);
    } catch (err: any) {
      if (err?.code === "P2025") {
        this.logger.warn(`Webhook ${eventName}: user no longer exists — ignored`);
        return { received: true };
      }
      this.logger.error(`Webhook ${eventName} failed: ${err?.message || err}`);
      throw new InternalServerErrorException({ message: "Webhook processing failed" });
    }

    return { received: true };
  }

  private async resolveUserId(
    payload: any,
    resourceType: string,
    attrs: any,
  ): Promise<string | null> {
    const customUserId = payload?.meta?.custom_data?.user_id;
    if (customUserId && UUID_RE.test(String(customUserId))) {
      const user = await this.prisma.user.findUnique({
        where: { id: String(customUserId) },
        select: { id: true },
      });
      if (user) return user.id;
    }

    if (resourceType === "subscriptions" && payload?.data?.id) {
      const user = await this.prisma.user.findFirst({
        where: { lemonSubscriptionId: String(payload.data.id) },
        select: { id: true },
      });
      if (user) return user.id;
    }

    if (attrs?.customer_id) {
      const user = await this.prisma.user.findFirst({
        where: { lemonCustomerId: String(attrs.customer_id) },
        select: { id: true },
      });
      if (user) return user.id;
    }

    return null;
  }

  private async applyEvent(
    userId: string,
    eventName: string,
    ctx: { resourceType: string; resourceId?: string; attrs: any },
  ): Promise<void> {
    const { resourceType, resourceId, attrs } = ctx;

    switch (eventName) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed":
      case "subscription_unpaused":
      case "subscription_plan_changed":
      case "subscription_payment_success":
      case "subscription_payment_recovered":
        await this.syncSubscription(userId, resourceName(resourceType, resourceId), attrs);
        return;

      case "subscription_cancelled": {
        const endsAt = attrs.ends_at ? new Date(attrs.ends_at) : null;
        const accessEnded = !endsAt || endsAt.getTime() <= Date.now();
        if (accessEnded) {
          await this.downgrade(userId, "canceled");
        } else {
          await this.prisma.user.update({
            where: { id: userId },
            data: { subscriptionStatus: "canceling" },
          });
        }
        return;
      }

      case "subscription_paused":
        await this.prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: "paused" },
        });
        return;

      case "subscription_payment_failed":
        await this.prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: "past_due" },
        });
        return;

      case "subscription_expired":
        await this.downgrade(userId, "expired");
        return;

      case "order_created":
        await this.activatePro(userId, {
          customerId: attrs.customer_id,
          subscriptionId: null,
          status: "active",
        });
        return;

      case "order_refunded":
      case "subscription_payment_refunded":
        await this.downgrade(userId, "refunded");
        return;

      case "customer_updated":
      default:
        return;
    }
  }

  private async syncSubscription(
    userId: string,
    subscriptionId: string | undefined,
    attrs: any,
  ): Promise<void> {
    const status = typeof attrs.status === "string" && attrs.status ? attrs.status : "active";
    const endsAt = attrs.ends_at ? new Date(attrs.ends_at) : null;
    const accessEnded =
      status === "expired" ||
      status === "unpaid" ||
      (status === "canceled" && (!endsAt || endsAt.getTime() <= Date.now()));

    if (accessEnded) {
      await this.downgrade(userId, status);
      return;
    }

    if (status === "past_due" || status === "paused" || status === "canceled") {
      await this.prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: status },
      });
      return;
    }

    await this.activatePro(userId, {
      customerId: attrs.customer_id,
      subscriptionId,
      status,
    });
  }

  private async activatePro(userId: string, opts: ActivateOptions) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        tier: TIERS.PRO,
        dailyLimit: dailyCreditsForTier(TIERS.PRO),
        ...(opts.customerId ? { lemonCustomerId: String(opts.customerId) } : {}),
        ...(opts.subscriptionId ? { lemonSubscriptionId: String(opts.subscriptionId) } : {}),
        subscriptionStatus: opts.status || "active",
      },
    });
  }

  private async downgrade(userId: string, status: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        tier: TIERS.FREE,
        dailyLimit: dailyCreditsForTier(TIERS.FREE),
        subscriptionStatus: status,
      },
    });
  }
}

function resourceName(resourceType: string, resourceId?: string): string | undefined {
  if (resourceType === "subscriptions" && resourceId) return resourceId;
  return undefined;
}
