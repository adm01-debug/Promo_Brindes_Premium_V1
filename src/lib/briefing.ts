import { getProductById } from "@/lib/catalog";

export const BRIEFING_CONTRACT_VERSION = "2026-09-21";

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
  message?: string;
  items: BriefingItem[];
};

type ValidationResult =
  | { ok: true; value: BriefingPayload }
  | { ok: false; message: string };

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

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

/** Validates public input without accepting supplier or price data from a browser. */
export function validateBriefing(input: unknown): ValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { ok: false, message: "Solicitação inválida." };
  const data = input as Record<string, unknown>;
  const name = text(data.name, 120);
  const company = text(data.company, 160);
  const email = text(data.email, 200).toLowerCase();
  const occasion = text(data.occasion, 120);
  const date = text(data.date, 10);
  const budget = text(data.budget, 80);
  const message = text(data.message, 2000);

  if (
    !name ||
    !company ||
    !occasion ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )
    return { ok: false, message: "Revise nome, empresa, e-mail e ocasião." };
  if (date && !isCalendarDate(date))
    return { ok: false, message: "A data informada não é válida." };
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
    const product = getProductById(productId);
    if (
      !product ||
      seen.has(productId) ||
      !Number.isInteger(quantity) ||
      typeof quantity !== "number" ||
      quantity < Math.max(1, product.minimum ?? 1) ||
      quantity > 10000
    )
      return { ok: false, message: "Revise as quantidades selecionadas." };
    seen.add(productId);
    items.push({ productId, quantity });
  }

  return {
    ok: true,
    value: { name, company, email, occasion, date, budget, message, items },
  };
}

export function toCommercialPayload(briefing: BriefingPayload) {
  return {
    contractVersion: BRIEFING_CONTRACT_VERSION,
    contact: {
      name: briefing.name,
      company: briefing.company,
      email: briefing.email,
    },
    project: {
      occasion: briefing.occasion,
      desiredDate: briefing.date || null,
      budget: briefing.budget || null,
      message: briefing.message || null,
    },
    items: briefing.items.map((item) => {
      const product = getProductById(item.productId);
      return {
        productId: item.productId,
        sku: product?.sku,
        quantity: item.quantity,
      };
    }),
  };
}
