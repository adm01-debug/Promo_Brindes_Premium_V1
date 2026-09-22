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

const forbiddenDestinationHosts = new Set([
  "doufsxqlfjyuvxuezpln.supabase.co",
  "doufsxqlfjyuvxuezpln.functions.supabase.co",
  "db.doufsxqlfjyuvxuezpln.supabase.co",
]);

function allowedDestinationHosts(value: string | undefined) {
  if (!value) return new Set<string>();
  const hosts = value.split(",").map((host) => host.trim().toLowerCase());
  if (
    hosts.length > 10 ||
    hosts.some(
      (host) =>
        !host ||
        host.length > 253 ||
        host.startsWith(".") ||
        host.endsWith(".") ||
        host.includes("..") ||
        !/^[a-z0-9.-]+$/.test(host) ||
        isIP(host) !== 0,
    )
  )
    return null;
  return new Set(hosts);
}

function destinationIsSafe(
  value: string | undefined,
  allowedHostsValue: string | undefined,
) {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.username || url.password || url.hash) return false;
    const isLocalDevelopment =
      process.env.NODE_ENV === "development" &&
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname);
    if (isLocalDevelopment) return true;
    const allowedHosts = allowedDestinationHosts(allowedHostsValue);
    // The operational project is a read-only product source, never a receiver.
    if (
      url.port ||
      url.protocol !== "https:" ||
      isIP(url.hostname) !== 0 ||
      url.hostname === "localhost" ||
      url.hostname.endsWith(".localhost") ||
      url.hostname.endsWith(".local") ||
      forbiddenDestinationHosts.has(url.hostname) ||
      !allowedHosts?.has(url.hostname)
    )
      return false;
    return true;
  } catch {
    return false;
  }
}

/** Same capability check for the API and the server-rendered privacy notice. */
export function briefingDeliveryConfig(): BriefingDeliveryConfig | null {
  if (process.env.BRIEFING_DELIVERY_ENABLED !== "true") return null;
  const destination = process.env.BRIEFING_WEBHOOK_URL;
  if (
    !destinationIsSafe(destination, process.env.BRIEFING_WEBHOOK_ALLOWED_HOSTS)
  )
    return null;
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
