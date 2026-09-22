import { isIP } from "node:net";
import { siteServerConfig, type SiteServerConfig } from "@/lib/site-database";

export type TrustedIpHeader =
  | "x-vercel-forwarded-for"
  | "cf-connecting-ip"
  | "x-real-ip";

export type BriefingDeliveryConfig = {
  destination: string;
  database: SiteServerConfig;
  ipHeader: TrustedIpHeader;
};

function destinationIsSafe(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" ||
      (process.env.NODE_ENV === "development" &&
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname))
    );
  } catch {
    return false;
  }
}

/** Same capability check for the API and the server-rendered privacy notice. */
export function briefingDeliveryConfig(): BriefingDeliveryConfig | null {
  if (process.env.BRIEFING_DELIVERY_ENABLED !== "true") return null;
  const destination = process.env.BRIEFING_WEBHOOK_URL;
  if (!destinationIsSafe(destination)) return null;
  const ipHeader = process.env.PROMO_PREMIUM_CLIENT_IP_HEADER;
  if (
    ipHeader !== "x-vercel-forwarded-for" &&
    ipHeader !== "cf-connecting-ip" &&
    ipHeader !== "x-real-ip"
  )
    return null;
  try {
    const database = siteServerConfig();
    return database ? { destination: destination!, database, ipHeader } : null;
  } catch {
    return null;
  }
}

export function trustedBriefingAddress(
  headers: Headers,
  header: TrustedIpHeader,
) {
  const value = headers.get(header)?.trim();
  return value && isIP(value) ? value : null;
}
