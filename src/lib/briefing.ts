import { products, type Product } from "@/lib/catalog";

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

const text = (value: unknown, max: number) => {
  if (typeof value !== "string") return null;
  const result = value.trim();
  return result.length <= max ? result : null;
};
const optionalText = (value: unknown, max: number) =>
  value === undefined || value === null ? "" : text(value, max);

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
export function validateBriefing(
  input: unknown,
  catalogItems: readonly Product[] = products,
): ValidationResult {
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

  if (
    !name ||
    !company ||
    !occasion ||
    email === null ||
    budget === null ||
    message === null ||
    date === null ||
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
    const product = catalogItems.find(
      (candidate) => candidate.id === productId,
    );
    if (
      !productId ||
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
    },
    project: {
      occasion: briefing.occasion,
      desiredDate: briefing.date || null,
      budget: briefing.budget || null,
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
