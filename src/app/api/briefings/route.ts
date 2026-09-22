import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  BRIEFING_CONTRACT_VERSION,
  toCommercialPayload,
  validateBriefing,
} from "@/lib/briefing";
import { getSiteCatalogPage, siteServerConfig } from "@/lib/site-database";

export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_BODY_BYTES = 16 * 1024;
const attempts = new Map<string, number[]>();

type DeliveryConfig = {
  destination: string;
  database: { url: string; secret: string };
};
type PersistedBriefing = {
  protocol: string;
  duplicate: boolean;
  payload_conflict: boolean;
  delivery_status: "pending" | "delivering" | "delivered" | "failed";
};
type DeliveryClaim = {
  protocol: string;
  claimed: boolean;
  delivery_status: "delivering" | "delivered";
};

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

function deliveryConfig(): DeliveryConfig | null {
  if (process.env.BRIEFING_DELIVERY_ENABLED !== "true") return null;
  const destination = process.env.BRIEFING_WEBHOOK_URL;
  if (!destinationIsSafe(destination)) return null;
  try {
    const database = siteServerConfig();
    return database ? { destination: destination!, database } : null;
  } catch {
    return null;
  }
}

function validIdempotencyKey(value: string | null) {
  return Boolean(value && /^[a-zA-Z0-9_-]{16,128}$/.test(value));
}

function jsonNoStore(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function parseBody(request: NextRequest): Promise<unknown | null> {
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > MAX_BODY_BYTES) throw new Error("PAYLOAD_TOO_LARGE");
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

async function rpc<T>(
  config: DeliveryConfig["database"],
  name: string,
  payload: object,
): Promise<T> {
  const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: config.secret,
      Authorization: `Bearer ${config.secret}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`RPC_${name}_FAILED`);
  return (await response.json()) as T;
}

function briefingHash(value: object) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function submittedProductIds(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return [];
  const items = (input as Record<string, unknown>).items;
  if (!Array.isArray(items) || items.length > 24) return [];
  return items.flatMap((item) => {
    const id =
      item && typeof item === "object" && !Array.isArray(item)
        ? (item as Record<string, unknown>).productId
        : null;
    return typeof id === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id,
      )
      ? [id]
      : [];
  });
}

async function persistBriefing(
  config: DeliveryConfig["database"],
  key: string,
  body: {
    name: string;
    company: string;
    email: string;
    occasion: string;
    date?: string;
    budget?: string;
    message?: string;
    items: { productId: string; quantity: number }[];
  },
  catalog: Awaited<ReturnType<typeof getSiteCatalogPage>>["items"],
) {
  const commercial = toCommercialPayload(body, catalog);
  const rows = await rpc<PersistedBriefing[]>(
    config,
    "persist_premium_briefing",
    {
      p_idempotency_key: key,
      p_request_hash: briefingHash(commercial),
      p_contact_name: body.name,
      p_company: body.company,
      p_email: body.email,
      p_occasion: body.occasion,
      p_desired_date: body.date || null,
      p_budget: body.budget || null,
      p_message: body.message || null,
      p_items: commercial.items,
    },
  );
  const row = rows[0];
  if (
    !row ||
    typeof row.protocol !== "string" ||
    typeof row.duplicate !== "boolean" ||
    typeof row.payload_conflict !== "boolean" ||
    !["pending", "delivering", "delivered", "failed"].includes(
      row.delivery_status,
    )
  )
    throw new Error("PERSISTED_BRIEFING_INVALID");
  return { row, commercial };
}

async function recordDelivery(
  config: DeliveryConfig["database"],
  key: string,
  delivered: boolean,
  error?: string,
) {
  const rows = await rpc<{ protocol: string }[]>(
    config,
    "record_premium_briefing_delivery",
    {
      p_idempotency_key: key,
      p_delivered: delivered,
      p_error: error || null,
    },
  );
  if (!rows[0]?.protocol) throw new Error("DELIVERY_RECORD_INVALID");
}

async function claimDelivery(config: DeliveryConfig["database"], key: string) {
  const rows = await rpc<DeliveryClaim[]>(
    config,
    "claim_premium_briefing_delivery",
    { p_idempotency_key: key },
  );
  const row = rows[0];
  if (
    !row ||
    typeof row.protocol !== "string" ||
    typeof row.claimed !== "boolean" ||
    !["delivering", "delivered"].includes(row.delivery_status)
  )
    throw new Error("DELIVERY_CLAIM_INVALID");
  return row;
}

/** Does not reveal receiver URLs or enable data collection without an explicit flag. */
export function GET() {
  return jsonNoStore({ configured: Boolean(deliveryConfig()) });
}

export async function POST(request: NextRequest) {
  if (!originIsAllowed(request))
    return jsonNoStore({ error: "ORIGIN_REJECTED" }, 403);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return jsonNoStore({ error: "JSON_REQUIRED" }, 415);
  if (!canAttempt(clientAddress(request)))
    return jsonNoStore({ error: "RATE_LIMITED" }, 429);
  const key = request.headers.get("idempotency-key");
  if (!validIdempotencyKey(key))
    return jsonNoStore({ error: "IDEMPOTENCY_KEY_REQUIRED" }, 400);

  let input: unknown;
  try {
    input = await parseBody(request);
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE")
      return jsonNoStore({ error: "PAYLOAD_TOO_LARGE" }, 413);
    return jsonNoStore({ error: "INVALID_BRIEFING" }, 422);
  }
  let catalog;
  try {
    catalog = (
      await getSiteCatalogPage({
        ids: submittedProductIds(input),
        pageSize: 24,
      })
    ).items;
  } catch {
    return jsonNoStore({ error: "CATALOG_UNAVAILABLE" }, 503);
  }
  const parsed = validateBriefing(input, catalog);
  if (!parsed.ok)
    return jsonNoStore(
      { error: "INVALID_BRIEFING", message: parsed.message },
      422,
    );
  const config = deliveryConfig();
  if (!config) return jsonNoStore({ error: "DESTINATION_UNAVAILABLE" }, 503);

  let persisted;
  try {
    persisted = await persistBriefing(
      config.database,
      key!,
      parsed.value,
      catalog,
    );
  } catch {
    return jsonNoStore({ error: "PERSISTENCE_UNAVAILABLE" }, 503);
  }
  if (persisted.row.payload_conflict)
    return jsonNoStore({ error: "IDEMPOTENCY_PAYLOAD_CONFLICT" }, 409);
  if (persisted.row.delivery_status === "delivered")
    return jsonNoStore(
      { protocol: persisted.row.protocol, duplicate: true },
      200,
    );

  let claim;
  try {
    claim = await claimDelivery(config.database, key!);
  } catch {
    return jsonNoStore({ error: "PERSISTENCE_UNAVAILABLE" }, 503);
  }
  if (!claim.claimed)
    return jsonNoStore(
      { protocol: claim.protocol, duplicate: true, pending: true },
      202,
    );

  try {
    const response = await fetch(config.destination, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": key!,
        "X-Promo-Contract-Version": BRIEFING_CONTRACT_VERSION,
      },
      body: JSON.stringify({
        protocol: persisted.row.protocol,
        ...persisted.commercial,
      }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("DESTINATION_FAILED");
    await recordDelivery(config.database, key!, true);
  } catch {
    try {
      await recordDelivery(config.database, key!, false, "destination_failed");
    } catch {
      // The briefing row remains durable and can be reconciled by an operator.
    }
    return jsonNoStore(
      { error: "BRIEFING_PENDING", protocol: persisted.row.protocol },
      503,
    );
  }
  return jsonNoStore(
    { protocol: persisted.row.protocol, duplicate: persisted.row.duplicate },
    persisted.row.duplicate ? 200 : 201,
  );
}
