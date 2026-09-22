import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  BRIEFING_CONTRACT_VERSION,
  toCommercialPayload,
  validateBriefing,
} from "@/lib/briefing";

export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const IDEMPOTENCY_MS = 24 * 60 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_BODY_BYTES = 16 * 1024;
const attempts = new Map<string, number[]>();
const delivered = new Map<string, { protocol: string; expiresAt: number }>();

function clientAddress(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

function originIsAllowed(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const configured = process.env.PROMO_PREMIUM_SITE_ORIGIN;
  return origin === (configured || request.nextUrl.origin);
}

function canAttempt(address: string) {
  const now = Date.now();
  const recent = (attempts.get(address) ?? []).filter(
    (time) => now - time < WINDOW_MS,
  );
  if (recent.length >= MAX_REQUESTS) return false;
  attempts.set(address, [...recent, now]);
  return true;
}

function pruneMemory() {
  const now = Date.now();
  for (const [key, value] of delivered)
    if (value.expiresAt <= now) delivered.delete(key);
  for (const [address, values] of attempts) {
    const recent = values.filter((time) => now - time < WINDOW_MS);
    if (recent.length) attempts.set(address, recent);
    else attempts.delete(address);
  }
}

function destinationIsSafe(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.hostname === "localhost";
  } catch {
    return false;
  }
}

function validIdempotencyKey(value: string | null) {
  return Boolean(value && /^[a-zA-Z0-9_-]{16,128}$/.test(value));
}

/**
 * GET never reveals the destination. It only lets the client retain a truthful
 * local-download experience when a commercial receiver is not configured.
 */
export function GET() {
  return NextResponse.json(
    { configured: Boolean(process.env.BRIEFING_WEBHOOK_URL) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  if (!originIsAllowed(request))
    return NextResponse.json({ error: "ORIGIN_REJECTED" }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json"))
    return NextResponse.json({ error: "JSON_REQUIRED" }, { status: 415 });
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (!Number.isFinite(contentLength) || contentLength > MAX_BODY_BYTES)
    return NextResponse.json({ error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  pruneMemory();
  const address = clientAddress(request);
  if (!canAttempt(address))
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });

  const key = request.headers.get("idempotency-key");
  if (!validIdempotencyKey(key))
    return NextResponse.json(
      { error: "IDEMPOTENCY_KEY_REQUIRED" },
      { status: 400 },
    );
  const prior = delivered.get(key!);
  if (prior && prior.expiresAt > Date.now())
    return NextResponse.json(
      { protocol: prior.protocol, duplicate: true },
      { headers: { "Cache-Control": "no-store" } },
    );

  const parsed = validateBriefing(await request.json().catch(() => null));
  if (!parsed.ok)
    return NextResponse.json(
      { error: "INVALID_BRIEFING", message: parsed.message },
      { status: 422 },
    );

  const destination = process.env.BRIEFING_WEBHOOK_URL;
  if (!destination || !destinationIsSafe(destination))
    return NextResponse.json(
      { error: "DESTINATION_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );

  const protocol = `PB-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
  try {
    const response = await fetch(destination, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": key!,
        "X-Promo-Contract-Version": BRIEFING_CONTRACT_VERSION,
      },
      body: JSON.stringify({ protocol, ...toCommercialPayload(parsed.value) }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!response.ok)
      return NextResponse.json(
        { error: "DESTINATION_FAILED" },
        { status: 502 },
      );
  } catch {
    return NextResponse.json({ error: "DESTINATION_FAILED" }, { status: 502 });
  }
  delivered.set(key!, { protocol, expiresAt: Date.now() + IDEMPOTENCY_MS });
  return NextResponse.json(
    { protocol, duplicate: false },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
