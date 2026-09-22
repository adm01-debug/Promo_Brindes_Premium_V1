import { createHash, createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  BRIEFING_CONTRACT_VERSION,
  briefingDatabaseMessage,
  parseBriefingInput,
  toCommercialPayload,
  validateBriefing,
  type BriefingPayload,
} from "@/lib/briefing";
import { getSiteCatalogPage } from "@/lib/site-database";
import {
  briefingDeliveryConfig,
  trustedBriefingAddress,
  type BriefingDeliveryConfig,
} from "@/lib/briefing-delivery-config";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;

type PersistedBriefing = {
  protocol: string;
  duplicate: boolean;
  payload_conflict: boolean;
  delivery_status: "pending" | "delivering" | "delivered" | "failed";
};
type ExistingBriefing = Pick<
  PersistedBriefing,
  "protocol" | "payload_conflict" | "delivery_status"
>;
type DeliveryClaim = {
  protocol: string;
  claimed: boolean;
  delivery_status: "delivering" | "delivered";
};

function originIsAllowed(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const configured = process.env.PROMO_PREMIUM_SITE_ORIGIN;
  return origin === (configured || request.nextUrl.origin);
}

async function canAttemptDistributed(
  config: BriefingDeliveryConfig,
  address: string,
) {
  const identity = createHmac("sha256", config.database.secret)
    .update(address)
    .digest("hex");
  const allowed = await rpc<boolean>(
    config.database,
    "allow_premium_briefing_attempt",
    { p_client_hash: identity },
  );
  if (typeof allowed !== "boolean")
    throw new Error("RATE_LIMIT_RESPONSE_INVALID");
  return allowed;
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
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        try {
          await reader.cancel();
        } catch {
          // A failed cancellation must not turn an oversized body into a 422.
        }
        throw new Error("PAYLOAD_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

async function rpc<T>(
  config: BriefingDeliveryConfig["database"],
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

async function lookupBriefing(
  config: BriefingDeliveryConfig["database"],
  key: string,
  body: BriefingPayload,
) {
  const rows = await rpc<ExistingBriefing[]>(
    config,
    "lookup_premium_briefing",
    {
      p_idempotency_key: key,
      p_request_hash: briefingHash(body),
    },
  );
  if (!Array.isArray(rows) || rows.length > 1)
    throw new Error("BRIEFING_LOOKUP_INVALID");
  const row = rows[0];
  if (!row) return null;
  if (
    typeof row.protocol !== "string" ||
    typeof row.payload_conflict !== "boolean" ||
    !["pending", "delivering", "delivered", "failed"].includes(
      row.delivery_status,
    )
  )
    throw new Error("BRIEFING_LOOKUP_INVALID");
  return row;
}

function existingResponse(row: ExistingBriefing | null) {
  if (!row) return null;
  if (row.payload_conflict)
    return jsonNoStore({ error: "IDEMPOTENCY_PAYLOAD_CONFLICT" }, 409);
  if (row.delivery_status === "delivered")
    return jsonNoStore({ protocol: row.protocol, duplicate: true }, 200);
  if (row.delivery_status === "delivering")
    return jsonNoStore(
      { protocol: row.protocol, duplicate: true, pending: true },
      202,
    );
  return null;
}

async function persistBriefing(
  config: BriefingDeliveryConfig["database"],
  key: string,
  body: BriefingPayload,
  catalog: Awaited<ReturnType<typeof getSiteCatalogPage>>["items"],
) {
  const commercial = toCommercialPayload(body, catalog);
  const rows = await rpc<PersistedBriefing[]>(
    config,
    "persist_premium_briefing",
    {
      p_idempotency_key: key,
      p_request_hash: briefingHash(body),
      p_contact_name: body.name,
      p_company: body.company,
      p_email: body.email,
      p_occasion: body.occasion,
      p_desired_date: body.date || null,
      p_budget: body.budget || null,
      p_message: briefingDatabaseMessage(body),
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
  config: BriefingDeliveryConfig["database"],
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

async function claimDelivery(
  config: BriefingDeliveryConfig["database"],
  key: string,
) {
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
  return jsonNoStore({ configured: Boolean(briefingDeliveryConfig()) });
}

export async function POST(request: NextRequest) {
  if (!originIsAllowed(request))
    return jsonNoStore({ error: "ORIGIN_REJECTED" }, 403);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return jsonNoStore({ error: "JSON_REQUIRED" }, 415);
  const key = request.headers.get("idempotency-key");
  if (!validIdempotencyKey(key))
    return jsonNoStore({ error: "IDEMPOTENCY_KEY_REQUIRED" }, 400);
  const config = briefingDeliveryConfig();
  if (config) {
    const address = trustedBriefingAddress(request.headers, config.ipHeader);
    if (!address)
      return jsonNoStore({ error: "CLIENT_ADDRESS_UNAVAILABLE" }, 503);
    try {
      if (!(await canAttemptDistributed(config, address)))
        return jsonNoStore({ error: "RATE_LIMITED" }, 429);
    } catch {
      return jsonNoStore({ error: "RATE_LIMIT_UNAVAILABLE" }, 503);
    }
  }

  let input: unknown;
  try {
    input = await parseBody(request);
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE")
      return jsonNoStore({ error: "PAYLOAD_TOO_LARGE" }, 413);
    return jsonNoStore({ error: "INVALID_BRIEFING" }, 422);
  }
  const intent = parseBriefingInput(input);
  if (!intent.ok)
    return jsonNoStore(
      { error: "INVALID_BRIEFING", message: intent.message },
      422,
    );

  let existing: ExistingBriefing | null = null;
  if (config) {
    try {
      existing = await lookupBriefing(config.database, key!, intent.value);
    } catch {
      return jsonNoStore({ error: "PERSISTENCE_UNAVAILABLE" }, 503);
    }
    const response = existingResponse(existing);
    if (response) return response;
  }

  let catalog;
  try {
    catalog = (
      await getSiteCatalogPage(
        {
          ids: intent.value.items.map((item) => item.productId),
          pageSize: 24,
        },
        { fresh: true },
      )
    ).items;
  } catch {
    if (existing)
      return jsonNoStore(
        { error: "BRIEFING_PENDING", protocol: existing.protocol },
        503,
      );
    return jsonNoStore({ error: "CATALOG_UNAVAILABLE" }, 503);
  }
  const parsed = validateBriefing(input, catalog);
  if (!parsed.ok) {
    // Another request may have persisted this key after the first lookup.
    if (!existing && config) {
      try {
        existing = await lookupBriefing(config.database, key!, intent.value);
      } catch {
        return jsonNoStore({ error: "PERSISTENCE_UNAVAILABLE" }, 503);
      }
      const response = existingResponse(existing);
      if (response) return response;
    }
    if (existing)
      return jsonNoStore(
        { error: "BRIEFING_PENDING", protocol: existing.protocol },
        503,
      );
    return jsonNoStore(
      { error: "INVALID_BRIEFING", message: parsed.message },
      422,
    );
  }
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
  try {
    await recordDelivery(config.database, key!, true);
  } catch {
    // The receiver accepted the request. Do not mislabel it as a failed
    // delivery; a later reconciliation must resolve the uncertain DB state.
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
