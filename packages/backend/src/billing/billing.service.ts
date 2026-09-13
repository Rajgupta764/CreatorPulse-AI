import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as crypto from "node:crypto";

function getApiKey() {
  const key = process.env.LEMON_SQUEEZY_API_KEY;
  if (!key || key === "your_api_key_here") return null;
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

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async createCheckoutSession(userId: string, email: string) {
    const apiKey = getApiKey();
    if (!apiKey) {
      return { error: "Lemon Squeezy is not configured yet. Please set LEMON_SQUEEZY_API_KEY in .env" };
    }

    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;
    if (!storeId || !variantId) {
      return { error: "Missing LEMON_SQUEEZY_STORE_ID or LEMON_SQUEEZY_VARIANT_ID in .env" };
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

    const json = await lemonFetch("checkouts", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (json.errors) {
      return { error: json.errors?.[0]?.detail || "Checkout creation failed" };
    }

    return { url: json.data?.attributes?.url };
  }

  async createPortalSession(_userId: string) {
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    if (!storeId) {
      return { error: "Store ID not configured." };
    }
    return { url: `https://store.lemonsqueezy.com/billing?store=${storeId}` };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    if (!secret || secret === "your_webhook_secret") {
      return { received: true, note: "Webhook secret not configured" };
    }

    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const sig = Buffer.from(signature || "", "utf8");

    if (!crypto.timingSafeEqual(digest, sig)) {
      return { error: "Invalid signature" };
    }

    const payload = JSON.parse(rawBody.toString("utf8"));
    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data;
    const userId = customData?.user_id;
    const subscriptionId = payload.data?.id;

    if (!userId) return { received: true };

    try {
      if (eventName === "subscription_created" || eventName === "order_created") {
        const customerId = payload.data?.attributes?.customer_id;
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            tier: "pro",
            dailyLimit: 100,
            lemonCustomerId: customerId ? String(customerId) : undefined,
            lemonSubscriptionId: subscriptionId ? String(subscriptionId) : undefined,
            subscriptionStatus: "active",
          },
        });
      }

      if (eventName === "subscription_expired" || eventName === "subscription_cancelled") {
        await this.prisma.user.update({
          where: { id: userId },
          data: { tier: "free", dailyLimit: 3, subscriptionStatus: "canceled" },
        });
      }
    } catch {
      // user might not exist or already processed
    }

    return { received: true };
  }
}
