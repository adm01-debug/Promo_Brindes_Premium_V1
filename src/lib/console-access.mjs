/**
 * The operations console is an internal tool for the site owner. It stays off
 * unless a long random token is configured, and the same token signs the
 * session cookie used by every console API call.
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const CONSOLE_COOKIE = "promo_operacoes";
export const CONSOLE_TOKEN_MIN_LENGTH = 32;
export const CONSOLE_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const noncePattern = /^[0-9a-f]{24}$/;

function tokenOf(value) {
  return typeof value === "string" ? value : "";
}

/** Returns the console configuration, or null when the console must stay hidden. */
export function consoleAccessConfig(env = process.env) {
  if (env.PROMO_PREMIUM_CONSOLE_ENABLED !== "true") return null;
  const token = tokenOf(env.PROMO_PREMIUM_CONSOLE_TOKEN);
  if (token.length < CONSOLE_TOKEN_MIN_LENGTH || /\s/.test(token)) return null;
  return { token, ttlMs: CONSOLE_SESSION_TTL_MS };
}

function sessionKey(config) {
  return createHmac("sha256", config.token).update("promo-operacoes-session").digest();
}

function sign(config, payload) {
  return createHmac("sha256", sessionKey(config)).update(payload).digest("base64url");
}

/** Creates a signed session value with the configured expiration. */
export function issueConsoleSession(config, now = Date.now()) {
  const expiresAt = now + config.ttlMs;
  const payload = `v1.${expiresAt}.${randomBytes(12).toString("hex")}`;
  return `${payload}.${sign(config, payload)}`;
}

/** Verifies the signature and the expiration of a console session value. */
export function verifyConsoleSession(config, value, now = Date.now()) {
  if (!config || typeof value !== "string") return false;
  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  if (!noncePattern.test(parts[2])) return false;
  const expiresAt = Number(parts[1]);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;
  const expected = Buffer.from(sign(config, `v1.${parts[1]}.${parts[2]}`), "utf8");
  const received = Buffer.from(parts[3], "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Checks the token typed on the login form against the configured secret. */
export function matchesConsoleToken(config, presented) {
  if (!config) return false;
  const expected = Buffer.from(config.token, "utf8");
  const received = Buffer.from(tokenOf(presented), "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/**
 * The browser must be calling the console from the site itself, never from a
 * third-party page. Behind a proxy (Vercel, Traefik) `request.url` may point at
 * the internal address, so the check uses the forwarded host instead.
 * @param {Request} request
 * @returns {boolean}
 */
export function requestComesFromSelf(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  const protocol = forwardedProto || new URL(request.url).protocol.replace(":", "");
  try {
    return new URL(origin).origin === `${protocol}://${host}`;
  } catch {
    return false;
  }
}

/**
 * @param {number} maxAgeSeconds
 * @returns {{ httpOnly: true, sameSite: "strict", secure: boolean, path: string, maxAge: number }}
 */
export function sessionCookieOptions(maxAgeSeconds) {
  // The browser-test server runs in production mode over plain http.
  const siteOrigin = process.env.PROMO_PREMIUM_SITE_ORIGIN ?? "";
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: siteOrigin.startsWith("http://")
      ? false
      : process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}