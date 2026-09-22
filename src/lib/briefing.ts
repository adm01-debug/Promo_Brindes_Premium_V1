import { products, type Product } from "@/lib/catalog";

export const BRIEFING_CONTRACT_VERSION = "2026-09-22";

export const budgetScopes = ["per-gift", "total"] as const;
export const deadlineFlexibilities = ["flexible", "fixed"] as const;
export const contactChannels = [
  "email",
  "whatsapp",
  "phone",
  "undecided",
] as const;
export const logoStatuses = ["ready", "in-progress", "need-help"] as const;
export const briefingContextLabels = {
  deadlineFlexibility: {
    flexible: "data flexível",
    fixed: "data fixa",
  },
  contactChannel: {
    email: "e-mail",
    whatsapp: "WhatsApp",
    phone: "telefone",
    undecided: "sem preferência",
  },
  logoStatus: {
    ready: "logo pronto",
    "in-progress": "identidade em criação",
    "need-help": "precisa de orientação visual",
  },
} as const;

export type BriefingItem = {
  productId: string;
  quantity: number;
};

export type BriefingPayload = {
  name: string;
  company: string;
  email: string;
  occasion: string;
  date?: string;
  budget?: string;
  budgetScope?: (typeof budgetScopes)[number];
  eventDate?: string;
  deadlineFlexibility?: (typeof deadlineFlexibilities)[number];
  contactChannel?: (typeof contactChannels)[number];
  phone?: string;
  logoStatus?: (typeof logoStatuses)[number];
  message?: string;
  items: BriefingItem[];
};

type ValidationResult =
  | { ok: true; value: BriefingPayload }
  | { ok: false; message: string };

const text = (value: unknown, max: number) => {
  if (typeof value !== "string") return null;
  const result = value.trim();
  return result.length <= max ? result : null;
};
const optionalText = (value: unknown, max: number) =>
  value === undefined || value === null ? "" : text(value, max);
function optionalChoice<const T extends readonly string[]>(
  value: unknown,
  choices: T,
): T[number] | "" | null {
  if (value === undefined || value === null || value === "") return "";
  return typeof value === "string" && choices.includes(value)
    ? (value as T[number])
    : null;
}
const productIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Normalizes the user's intent independently of mutable catalog data. */
export function parseBriefingInput(input: unknown): ValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { ok: false, message: "Solicitação inválida." };
  const data = input as Record<string, unknown>;
  const name = text(data.name, 120);
  const company = text(data.company, 160);
  const rawEmail = text(data.email, 200);
  const email = rawEmail?.toLowerCase() ?? null;
  const occasion = text(data.occasion, 120);
  const rawDate = data.date;
  const date =
    rawDate === undefined || rawDate === null || rawDate === ""
      ? ""
      : text(rawDate, 10);
  const budget = optionalText(data.budget, 80);
  const message = optionalText(data.message, 2000);
  const budgetScope = optionalChoice(data.budgetScope, budgetScopes);
  const eventDate = optionalText(data.eventDate, 10);
  const deadlineFlexibility = optionalChoice(
    data.deadlineFlexibility,
    deadlineFlexibilities,
  );
  const contactChannel = optionalChoice(data.contactChannel, contactChannels);
  const phone = optionalText(data.phone, 24);
  const logoStatus = optionalChoice(data.logoStatus, logoStatuses);

  if (
    !name ||
    !company ||
    !occasion ||
    email === null ||
    budget === null ||
    message === null ||
    date === null ||
    budgetScope === null ||
    eventDate === null ||
    deadlineFlexibility === null ||
    contactChannel === null ||
    phone === null ||
    logoStatus === null ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )
    return { ok: false, message: "Revise nome, empresa, e-mail e ocasião." };
  if (date && !isCalendarDate(date))
    return { ok: false, message: "A data informada não é válida." };
  if (eventDate && !isCalendarDate(eventDate))
    return { ok: false, message: "A data do evento não é válida." };
  if (date && eventDate && date > eventDate)
    return {
      ok: false,
      message: "A data de recebimento não pode ser posterior à do evento.",
    };
  if ((budgetScope && !budget) || (budget && data.budgetScope === ""))
    return {
      ok: false,
      message:
        "Informe a faixa de investimento e se ela é por presente ou total.",
    };
  if (
    (contactChannel === "phone" || contactChannel === "whatsapp") &&
    (!phone || phone.replace(/\D/g, "").length < 10)
  )
    return {
      ok: false,
      message: "Informe um telefone válido para o canal de contato escolhido.",
    };
  if (phone && !/^[+\d\s()\-.]{10,24}$/.test(phone))
    return { ok: false, message: "Revise o telefone informado." };
  if (!Array.isArray(data.items) || data.items.length > 24)
    return { ok: false, message: "A seleção de produtos não é válida." };

  const seen = new Set<string>();
  const items: BriefingItem[] = [];
  for (const rawItem of data.items) {
    if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem))
      return { ok: false, message: "A seleção de produtos não é válida." };
    const item = rawItem as Record<string, unknown>;
    const productId = text(item.productId, 64);
    const quantity = item.quantity;
    if (
      !productId ||
      !productIdPattern.test(productId) ||
      seen.has(productId) ||
      !Number.isInteger(quantity) ||
      typeof quantity !== "number" ||
      quantity < 1 ||
      quantity > 10000
    )
      return { ok: false, message: "Revise as quantidades selecionadas." };
    seen.add(productId);
    items.push({ productId, quantity });
  }

  const value: BriefingPayload = {
    name,
    company,
    email,
    occasion,
    date,
    budget,
    message,
    items,
    ...(budgetScope ? { budgetScope } : {}),
    ...(eventDate ? { eventDate } : {}),
    ...(deadlineFlexibility ? { deadlineFlexibility } : {}),
    ...(contactChannel ? { contactChannel } : {}),
    ...(phone ? { phone } : {}),
    ...(logoStatus ? { logoStatus } : {}),
  };
  if ((briefingDatabaseMessage(value)?.length ?? 0) > 2000)
    return {
      ok: false,
      message: "Resuma as observações para caberem no briefing.",
    };
  return { ok: true, value };
}

/** Validates public input against the current catalog without trusting browser product data. */
export function validateBriefing(
  input: unknown,
  catalogItems: readonly Product[] = products,
): ValidationResult {
  const parsed = parseBriefingInput(input);
  if (!parsed.ok) return parsed;
  for (const item of parsed.value.items) {
    const product = catalogItems.find(
      (candidate) => candidate.id === item.productId,
    );
    if (!product || item.quantity < Math.max(1, product.minimum ?? 1))
      return { ok: false, message: "Revise as quantidades selecionadas." };
  }
  return parsed;
}

export function toCommercialPayload(
  briefing: BriefingPayload,
  catalogItems: readonly Product[] = products,
) {
  return {
    contractVersion: BRIEFING_CONTRACT_VERSION,
    contact: {
      name: briefing.name,
      company: briefing.company,
      email: briefing.email,
      phone: briefing.phone || null,
    },
    project: {
      occasion: briefing.occasion,
      desiredDate: briefing.date || null,
      budget: briefing.budget || null,
      budgetScope: briefing.budget ? briefing.budgetScope || "per-gift" : null,
      eventDate: briefing.eventDate || null,
      deadlineFlexibility: briefing.deadlineFlexibility || null,
      contactChannel: briefing.contactChannel || null,
      logoStatus: briefing.logoStatus || null,
      message: briefing.message || null,
    },
    items: briefing.items.map((item) => {
      const product = catalogItems.find(
        (candidate) => candidate.id === item.productId,
      );
      return {
        productId: item.productId,
        sku: product?.sku,
        quantity: item.quantity,
      };
    }),
  };
}

/** Store a human-readable copy without changing the deployed persistence RPC. */
export function briefingDatabaseMessage(
  briefing: BriefingPayload,
): string | null {
  const lines = [
    briefing.message || "",
    ...(briefing.budgetScope
      ? [
          `Investimento: ${briefing.budgetScope === "total" ? "total da ação" : "por presente"}`,
        ]
      : []),
    ...(briefing.eventDate ? [`Data do evento: ${briefing.eventDate}`] : []),
    ...(briefing.deadlineFlexibility
      ? [
          `Recebimento: ${briefingContextLabels.deadlineFlexibility[briefing.deadlineFlexibility]}`,
        ]
      : []),
    ...(briefing.contactChannel
      ? [
          `Canal preferido: ${briefingContextLabels.contactChannel[briefing.contactChannel]}`,
        ]
      : []),
    ...(briefing.phone ? [`Telefone: ${briefing.phone}`] : []),
    ...(briefing.logoStatus
      ? [
          `Identidade visual: ${briefingContextLabels.logoStatus[briefing.logoStatus]}`,
        ]
      : []),
  ].filter(Boolean);
  const value = lines.join("\n");
  return value || null;
}
