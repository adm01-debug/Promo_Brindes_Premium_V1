import { briefingDeliveryConfig } from "@/lib/briefing-delivery-config";
import { siteServerConfig, type SiteServerConfig } from "@/lib/site-database";
import {
  isBriefingStatus,
  isClientHash,
  isRfc3339,
  rateLimitReference,
  summarizeRateLimit,
  summarizeReplication,
  validateTechnicalSheet,
} from "@/lib/console-validation.mjs";
import { manageSitePublication } from "../../scripts/manage-site-publication.mjs";
import type {
  ConsoleActionBody,
  ConsoleActionResult,
  ConsoleBriefing,
  ConsoleCatalogItem,
  ConsoleDeliveryState,
  ConsoleLimit,
  ConsoleStatus,
} from "@/lib/operations-types";

const requestTimeoutMs = 10000;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const catalogColumns = [
  "id",
  "sku",
  "slug",
  "name",
  "category",
  "minimum",
  "personalizable",
  "editorial_order",
  "published",
  "published_from",
  "published_until",
  "materials",
  "dimensions",
  "weight_g",
  "packaging",
  "source_date",
  "updated_at",
].join(",");
const briefingColumns = [
  "id",
  "protocol",
  "contact_name",
  "company",
  "email",
  "occasion",
  "desired_date",
  "budget",
  "message",
  "items",
  "status",
  "created_at",
  "delivery_status",
  "delivery_attempts",
  "delivery_lease_expires_at",
  "last_delivery_error",
  "delivered_at",
].join(",");

/** An operational failure already translated to the console vocabulary. */
export class ConsoleError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ConsoleError";
    this.status = status;
  }
}

export function consoleDatabase(): SiteServerConfig | null {
  try {
    return siteServerConfig();
  } catch {
    throw new ConsoleError(
      "A configuração do banco premium está incompleta neste ambiente.",
      503,
    );
  }
}

function requiredDatabase() {
  const config = consoleDatabase();
  if (!config)
    throw new ConsoleError(
      "O banco premium não está configurado neste ambiente.",
      503,
    );
  return config;
}

type CallOptions = { method?: string; body?: string; prefer?: string };

async function call(config: SiteServerConfig, path: string, options: CallOptions = {}) {
  const headers: Record<string, string> = {
    apikey: config.secret,
    Authorization: `Bearer ${config.secret}`,
    Accept: "application/json",
  };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.prefer) headers.Prefer = options.prefer;
  let response: Response;
  try {
    response = await fetch(`${config.url}/rest/v1/${path}`, {
      method: options.method ?? "GET",
      body: options.body,
      redirect: "error",
      cache: "no-store",
      headers,
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
  } catch {
    throw new ConsoleError(
      "Não foi possível falar com o banco premium agora.",
      502,
    );
  }
  if (!response.ok)
    throw new ConsoleError(
      `O banco premium recusou a operação (HTTP ${response.status}).`,
      502,
    );
  return response;
}

async function rows<T>(response: Response): Promise<T[]> {
  const value: unknown = await response.json();
  if (!Array.isArray(value))
    throw new ConsoleError("O banco premium devolveu uma resposta inesperada.", 502);
  return value as T[];
}

function totalOf(response: Response) {
  const total = response.headers.get("content-range")?.split("/")[1];
  return total && /^\d+$/.test(total) ? Number(total) : 0;
}

async function count(config: SiteServerConfig, path: string) {
  return totalOf(await call(config, path, { prefer: "count=exact" }));
}

function deliveryDiagnosis(): ConsoleDeliveryState {
  let enabled = false;
  try {
    enabled = Boolean(briefingDeliveryConfig());
  } catch {
    enabled = false;
  }
  if (enabled) return { habilitada: true, motivo: null };
  const problems: string[] = [];
  if (process.env.BRIEFING_DELIVERY_ENABLED !== "true")
    problems.push("BRIEFING_DELIVERY_ENABLED não está como true");
  if (!process.env.BRIEFING_WEBHOOK_URL)
    problems.push("BRIEFING_WEBHOOK_URL está vazia");
  if (!process.env.BRIEFING_WEBHOOK_ALLOWED_HOSTS)
    problems.push("BRIEFING_WEBHOOK_ALLOWED_HOSTS está vazia");
  const secret = process.env.BRIEFING_WEBHOOK_SECRET;
  if (!secret)
    problems.push("BRIEFING_WEBHOOK_SECRET está vazio");
  else if (secret.length < 32 || secret.length > 256 || secret.trim() !== secret)
    problems.push(
      "BRIEFING_WEBHOOK_SECRET precisa ter de 32 a 256 caracteres, sem espaços nas pontas",
    );
  const ipHeader = process.env.PROMO_PREMIUM_CLIENT_IP_HEADER ?? "";
  if (
    !["x-vercel-forwarded-for", "cf-connecting-ip", "x-real-ip"].includes(
      ipHeader,
    )
  )
    problems.push(
      "PROMO_PREMIUM_CLIENT_IP_HEADER precisa ser x-vercel-forwarded-for, cf-connecting-ip ou x-real-ip",
    );
  if (!problems.length)
    problems.push(
      "a URL do receptor precisa ser https, sem porta, sem usuário e de um host listado em BRIEFING_WEBHOOK_ALLOWED_HOSTS",
    );
  return { habilitada: false, motivo: problems.join("; ") };
}

/**
 * Heartbeat da replicação. Uma leitura que falha só nesta consulta (tabela ainda
 * não instalada num ambiente novo, sem permissão para a chave usada) vira `null`
 * para não derrubar a aba Situação, enquanto uma tabela acessível e sem linha
 * vira `registrada: false` — o console distingue "não consegui consultar" de
 * "ainda não houve replicação". Banco fora do ar não chega aqui: as contagens de
 * `readConsoleStatus` falham antes e a aba inteira responde erro.
 */
async function readConsoleReplication(config: SiteServerConfig) {
  try {
    const response = await call(
      config,
      "premium_catalog_sync_state?select=last_attempt_at,last_status,last_success_at,last_error,source_count,curated_count&id=eq.true&limit=1",
    );
    const value = await rows<Record<string, unknown>>(response);
    return value.length ? summarizeReplication(value[0]) : summarizeReplication({});
  } catch {
    return null;
  }
}

export async function readConsoleStatus(): Promise<ConsoleStatus> {
  const entrega = deliveryDiagnosis();
  const config = consoleDatabase();
  const verificadoEm = new Date().toISOString();
  if (!config)
    return {
      banco: false,
      entrega,
      contagens: null,
      replicacao: null,
      verificadoEm,
    };
  const [itens, publicados, leads, leadsNaFila, leadsComFalha, limites, replicacao] =
    await Promise.all([
      count(config, "premium_catalog_items?select=id&limit=1"),
      count(config, "premium_catalog_items?select=id&published=eq.true&limit=1"),
      count(config, "premium_briefings?select=id&limit=1"),
      count(
        config,
        "premium_briefings?select=id&delivery_status=eq.pending&limit=1",
      ),
      count(
        config,
        "premium_briefings?select=id&delivery_status=eq.failed&limit=1",
      ),
      count(config, "premium_briefing_rate_limits?select=client_hash&limit=1"),
      readConsoleReplication(config),
    ]);
  return {
    banco: true,
    entrega,
    contagens: { itens, publicados, leads, leadsNaFila, leadsComFalha, limites },
    replicacao,
    verificadoEm,
  };
}

export async function readConsoleCatalog(): Promise<ConsoleCatalogItem[]> {
  const config = requiredDatabase();
  const response = await call(
    config,
    `premium_catalog_items?select=${catalogColumns}&order=editorial_order.asc&limit=500`,
  );
  const items = await rows<ConsoleCatalogItem>(response);
  return items.map((item) => ({
    ...item,
    materials: Array.isArray(item.materials) ? item.materials : [],
  }));
}

export async function readConsoleBriefings(): Promise<ConsoleBriefing[]> {
  const config = requiredDatabase();
  const response = await call(
    config,
    `premium_briefings?select=${briefingColumns}&order=created_at.desc&limit=200`,
  );
  return rows<ConsoleBriefing>(response);
}

export async function readConsoleLimits(): Promise<ConsoleLimit[]> {
  const config = requiredDatabase();
  const response = await call(
    config,
    "premium_briefing_rate_limits?select=client_hash,attempt_times,updated_at&order=updated_at.desc&limit=200",
  );
  const limits = await rows<{
    client_hash: string;
    attempt_times: unknown;
    updated_at: string;
  }>(response);
  return limits.map((limit) => {
    const summary = summarizeRateLimit(limit.attempt_times);
    return {
      client_hash: limit.client_hash,
      reference: rateLimitReference(limit.client_hash) ?? "",
      attempts: summary.attempts,
      recent_attempts: summary.recentAttempts,
      blocked: summary.blocked,
      last_attempt_at: summary.lastAttemptAt,
      updated_at: limit.updated_at,
    };
  });
}

const publicationMessages: Record<string, [string, number]> = {
  "Publication changed since the reviewed revision.": [
    "A publicação mudou desde que a tela foi carregada. Recarregue antes de aplicar.",
    409,
  ],
  "SKU confirmation does not match the publication record.": [
    "O SKU digitado não confere com o produto.",
    409,
  ],
  "Publication management requires one valid product UUID.": [
    "Produto inválido.",
    400,
  ],
  "At least one publication change is required.": [
    "Informe a situação ou a janela de publicação.",
    400,
  ],
};

async function saveTechnicalSheet(body: Extract<ConsoleActionBody, { acao: "catalogo-ficha" }>) {
  const config = requiredDatabase();
  if (typeof body.id !== "string" || !uuidPattern.test(body.id))
    throw new ConsoleError("Produto inválido.", 400);
  const sheet = validateTechnicalSheet({
    materials: body.materials,
    dimensions: body.dimensions,
    weightG: body.weightG,
    packaging: body.packaging,
  }) as {
    valid: boolean;
    errors: string[];
    value: {
      materials: string[];
      dimensions: string | null;
      weight_g: number | null;
      packaging: string | null;
    } | null;
  };
  if (!sheet.valid || !sheet.value)
    throw new ConsoleError(sheet.errors.join(" "), 400);
  if (!isRfc3339(body.expectedUpdatedAt))
    throw new ConsoleError(
      "Recarregue o catálogo antes de gravar a ficha.",
      400,
    );
  const response = await call(
    config,
    `premium_catalog_items?id=eq.${body.id}&updated_at=eq.${encodeURIComponent(
      body.expectedUpdatedAt,
    )}&select=id,sku,materials,dimensions,weight_g,packaging,updated_at`,
    {
      method: "PATCH",
      body: JSON.stringify(sheet.value),
      prefer: "return=representation,count=exact",
    },
  );
  const updated = await rows<ConsoleCatalogItem>(response);
  if (updated.length === 0)
    throw new ConsoleError(
      "A ficha mudou desde que a tela foi carregada. Recarregue a lista antes de gravar.",
      409,
    );
  const saved = updated.length === 1 ? updated[0] : null;
  if (!saved || saved.id !== body.id)
    throw new ConsoleError(
      "O banco não confirmou a gravação da ficha; recarregue a lista.",
      409,
    );
  const identical =
    JSON.stringify(saved.materials) === JSON.stringify(sheet.value.materials) &&
    saved.dimensions === sheet.value.dimensions &&
    saved.weight_g === sheet.value.weight_g &&
    saved.packaging === sheet.value.packaging;
  if (!identical)
    throw new ConsoleError(
      "O banco devolveu uma ficha diferente da enviada; recarregue a lista.",
      409,
    );
  return { mensagem: `Ficha técnica de ${saved.sku} gravada.` };
}

type PublicationState = {
  applied: boolean;
  noOp: boolean;
  current: { published: boolean; sku: string };
};

type PublicationManager = (
  id: string,
  changes: Record<string, unknown>,
  options: {
    apply: boolean;
    expectedUpdatedAt: string;
    confirmSku: string;
  },
) => Promise<PublicationState>;

const managePublication =
  manageSitePublication as unknown as PublicationManager;

async function savePublication(
  body: Extract<ConsoleActionBody, { acao: "catalogo-publicacao" }>,
) {
  requiredDatabase();
  if (typeof body.id !== "string" || !uuidPattern.test(body.id))
    throw new ConsoleError("Produto inválido.", 400);
  let result: PublicationState;
  try {
    result = await managePublication(
      body.id,
      {
        published: body.published,
        published_from: body.publishedFrom,
        published_until: body.publishedUntil,
      },
      {
        apply: true,
        expectedUpdatedAt: body.expectedUpdatedAt,
        confirmSku: body.confirmSku,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const known = publicationMessages[message];
    throw new ConsoleError(
      known ? known[0] : "A publicação não pôde ser aplicada; recarregue a tela.",
      known ? known[1] : 409,
    );
  }
  if (result.noOp)
    return { mensagem: `Nada mudou em ${result.current.sku}.` };
  return {
    mensagem: `${result.current.sku} ${
      result.current.published ? "está no ar" : "saiu do ar"
    } com a janela informada.`,
  };
}

async function requeueBriefing(
  body: Extract<ConsoleActionBody, { acao: "briefing-reenviar" }>,
) {
  const config = requiredDatabase();
  if (typeof body.id !== "string" || !uuidPattern.test(body.id))
    throw new ConsoleError("Lead inválido.", 400);
  const current = await rows<{
    delivery_status: string;
    delivery_lease_expires_at: string | null;
  }>(
    await call(
      config,
      `premium_briefings?id=eq.${body.id}&select=delivery_status,delivery_lease_expires_at`,
    ),
  );
  if (current.length !== 1)
    throw new ConsoleError("Esse lead não existe mais; recarregue a lista.", 409);
  const lease = current[0].delivery_lease_expires_at;
  if (
    current[0].delivery_status === "delivering" &&
    typeof lease === "string" &&
    Date.parse(lease) > Date.now()
  )
    throw new ConsoleError(
      "Esse lead está em envio agora. Espere o envio terminar (ou a reserva expirar) antes de reenfileirar.",
      409,
    );
  // A reserva lida entra na condição: se o envio público reservou o lead nesse
  // intervalo, a linha mudou e o PATCH não apaga a reserva nova.
  const leaseFilter =
    typeof lease === "string"
      ? `delivery_lease_expires_at=eq.${encodeURIComponent(lease)}`
      : "delivery_lease_expires_at=is.null";
  const response = await call(
    config,
    `premium_briefings?id=eq.${body.id}&delivery_status=in.(failed,delivering)&${leaseFilter}&select=id,protocol,delivery_status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        delivery_status: "pending",
        delivery_lease_token: null,
        delivery_lease_expires_at: null,
      }),
      prefer: "return=representation,count=exact",
    },
  );
  const updated = await rows<{ id: string; protocol: string }>(response);
  if (updated.length !== 1)
    throw new ConsoleError(
      "Esse lead mudou de estado desde que a lista foi carregada; recarregue antes de reenfileirar.",
      409,
    );
  return {
    mensagem: `Lead ${updated[0].protocol} voltou para a fila de entrega. O envio real depende do receptor comercial configurado.`,
  };
}

const BRIEFING_STATUS_LABELS = {
  received: "recebido",
  qualified: "qualificado",
  closed: "encerrado",
};

async function setBriefingStatus(
  body: Extract<ConsoleActionBody, { acao: "briefing-status" }>,
) {
  const config = requiredDatabase();
  if (typeof body.id !== "string" || !uuidPattern.test(body.id))
    throw new ConsoleError("Lead inválido.", 400);
  if (!isBriefingStatus(body.status))
    throw new ConsoleError(
      "Situação inválida: use recebido, qualificado ou encerrado.",
      400,
    );
  const response = await call(
    config,
    `premium_briefings?id=eq.${body.id}&select=id,protocol,status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: body.status }),
      prefer: "return=representation,count=exact",
    },
  );
  const updated = await rows<{ id: string; protocol: string; status: string }>(
    response,
  );
  if (updated.length !== 1 || updated[0].status !== body.status)
    throw new ConsoleError(
      "O banco não confirmou a mudança de situação; recarregue a lista.",
      409,
    );
  return {
    mensagem: `Lead ${updated[0].protocol} agora está como ${BRIEFING_STATUS_LABELS[body.status]}.`,
  };
}

async function pruneLimits() {
  const config = requiredDatabase();
  const response = await call(
    config,
    "rpc/prune_premium_briefing_rate_limits",
    { method: "POST", body: "{}", prefer: "return=representation" },
  );
  let value: unknown = null;
  try {
    value = await response.json();
  } catch {
    value = null;
  }
  const removed = typeof value === "number" ? value : null;
  return {
    mensagem:
      removed === null
        ? "Limpeza dos limites executada."
        : `Limpeza dos limites executada: ${removed} registro(s) removido(s).`,
  };
}

async function releaseLimit(
  body: Extract<ConsoleActionBody, { acao: "limites-liberar" }>,
) {
  const config = requiredDatabase();
  if (!isClientHash(body.clientHash))
    throw new ConsoleError("Contato inválido.", 400);
  const current = await rows<{ attempt_times: unknown }>(
    await call(
      config,
      `premium_briefing_rate_limits?client_hash=eq.${body.clientHash}&select=attempt_times`,
    ),
  );
  if (current.length !== 1)
    throw new ConsoleError(
      "Esse contato não está mais bloqueado; recarregue a lista.",
      409,
    );
  const attempts = Array.isArray(current[0].attempt_times)
    ? current[0].attempt_times.filter(
        (value): value is string => typeof value === "string",
      )
    : [];
  if (!summarizeRateLimit(attempts).blocked)
    throw new ConsoleError(
      "Esse contato não está bloqueado agora: ainda pode enviar. Nada foi apagado.",
      409,
    );
  // A exclusão repete as tentativas lidas: se o visitante tentou de novo no
  // intervalo, a linha mudou e a operação falha em vez de apagar o registro novo.
  const response = await call(
    config,
    `premium_briefing_rate_limits?client_hash=eq.${body.clientHash}&attempt_times=eq.${encodeURIComponent(
      `{${attempts.join(",")}}`,
    )}`,
    { method: "DELETE", prefer: "return=representation,count=exact" },
  );
  const removed = await rows<{ client_hash: string }>(response);
  if (removed.length !== 1 || removed[0].client_hash !== body.clientHash)
    throw new ConsoleError(
      "As tentativas mudaram desde que a lista foi carregada; recarregue antes de liberar.",
      409,
    );
  return { mensagem: "Contato liberado: já pode enviar um novo briefing." };
}

export async function runConsoleAction(
  body: ConsoleActionBody,
): Promise<ConsoleActionResult> {
  if (!body || typeof body !== "object")
    throw new ConsoleError("Ação inválida.", 400);
  switch (body.acao) {
    case "catalogo-ficha":
      return saveTechnicalSheet(body);
    case "catalogo-publicacao":
      return savePublication(body);
    case "briefing-reenviar":
      return requeueBriefing(body);
    case "briefing-status":
      return setBriefingStatus(body);
    case "limites-limpar":
      return pruneLimits();
    case "limites-liberar":
      return releaseLimit(body);
    default:
      throw new ConsoleError("Ação desconhecida.", 400);
  }
}