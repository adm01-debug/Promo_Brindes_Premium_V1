/**
 * Apresentacao executiva imprimivel da selecao (APV1-12).
 *
 * Regras que o teste cobre e que valem para o negocio:
 * - nenhum preco e inventado: o documento nunca mostra valor de peca;
 * - o documento carrega o contato de quem pediu, por isso e baixado como
 *   arquivo local e nunca vira link publico;
 * - dado ausente aparece como "Não informado", sem preencher lacuna;
 * - o HTML e autocontido e escapa todo texto vindo do catalogo.
 */

export const PRESENTATION_DISCLAIMER =
  "Documento de intenção. Não reserva estoque e não confirma preço, técnica, prazo ou disponibilidade.";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function text(value) {
  const clean = typeof value === "string" ? value.trim() : "";
  return clean ? clean : "Não informado";
}

function list(value) {
  const items = Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim())
    : [];
  return items.length ? items.join(" · ") : "Não informado";
}

function weight(value) {
  return Number.isFinite(value) && value > 0 ? `${value} g` : "Não informado";
}

/**
 * Monta os dados da apresentacao. A selecao precisa vir ja conferida no
 * catalogo pelo chamador; aqui so formalizamos o que foi confirmado.
 */
export function buildPresentation({
  briefing,
  products,
  quantities,
  generatedAt = new Date(),
}) {
  const items = (Array.isArray(products) ? products : [])
    .filter((product) => product && product.id)
    .map((product) => ({
      id: product.id,
      name: text(product.name),
      sku: text(product.sku),
      category: text(product.category),
      tagline: text(product.tagline),
      image: typeof product.image === "string" ? product.image : null,
      quantity:
        Number.isInteger(quantities?.[product.id]) &&
        quantities[product.id] > 0
          ? quantities[product.id]
          : null,
      minimum:
        Number.isInteger(product.minimum) && product.minimum > 0
          ? product.minimum
          : null,
      materials: list(product.materials),
      dimensions: text(product.dimensions),
      weight: weight(product.weightG),
      personalizable:
        typeof product.personalizable === "boolean"
          ? product.personalizable
            ? "Sim, sob consulta"
            : "Não prevista"
          : "Não informado",
    }));
  const totalPieces = items.reduce(
    (sum, item) => sum + (item.quantity ?? 0),
    0,
  );
  return {
    generatedAt:
      generatedAt instanceof Date && !Number.isNaN(generatedAt.valueOf())
        ? generatedAt
        : new Date(),
    company: text(briefing?.company),
    contact: text(briefing?.name),
    occasion: text(briefing?.occasion),
    eventDate: text(briefing?.eventDate),
    delivery: text(briefing?.date),
    items,
    totalPieces,
    disclaimer: PRESENTATION_DISCLAIMER,
  };
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}

const styles = `
  *{box-sizing:border-box}
  body{margin:0;font-family:Georgia,"Times New Roman",serif;color:#1f211c;background:#f7f5f0}
  main{max-width:900px;margin:0 auto;padding:48px 40px 72px}
  header{border-bottom:2px solid #c9b487;padding-bottom:20px;margin-bottom:28px}
  .eyebrow{font:600 10px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#7a7461;margin:0 0 10px}
  h1{font-size:34px;line-height:1.15;margin:0 0 8px;font-weight:400}
  h1 em{font-style:italic;color:#8a7443}
  .meta{font:400 11px/1.7 Helvetica,Arial,sans-serif;color:#5b5b52;margin:0}
  .facts{display:flex;flex-wrap:wrap;gap:10px 32px;margin:24px 0 32px;font:400 11px/1.6 Helvetica,Arial,sans-serif}
  .facts div{min-width:150px}
  .facts dt{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#7a7461;margin:0 0 3px}
  .facts dd{margin:0;font-size:13px}
  h2{font-size:20px;font-weight:400;margin:32px 0 14px;padding-bottom:6px;border-bottom:1px solid #dcd7c9}
  .item{display:flex;gap:18px;padding:16px 0;border-bottom:1px solid #e6e2d7;break-inside:avoid;page-break-inside:avoid}
  .item img{width:96px;height:96px;object-fit:contain;background:#eeece6;flex:0 0 96px}
  .fallback{width:96px;height:96px;flex:0 0 96px;background:#eeece6;display:grid;place-items:center;font:400 9px Helvetica,Arial,sans-serif;color:#7a7461}
  .item h3{font-size:17px;font-weight:400;margin:0 0 3px}
  .item small{display:block;font:400 9px/1.6 Helvetica,Arial,sans-serif;letter-spacing:.06em;color:#7a7461;text-transform:uppercase;margin-bottom:6px}
  .item dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px 18px;margin:8px 0 0;font:400 10px/1.6 Helvetica,Arial,sans-serif}
  .item dt{font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:#8a8474}
  .item dd{margin:0;color:#33352d}
  .qty{font:600 12px/1 Helvetica,Arial,sans-serif;color:#8a7443;margin-left:auto;text-align:right;white-space:nowrap}
  .empty{padding:24px;border:1px dashed #c9b487;font:400 12px/1.7 Helvetica,Arial,sans-serif;color:#5b5b52}
  footer{margin-top:32px;font:400 10px/1.8 Helvetica,Arial,sans-serif;color:#5b5b52;border-top:1px solid #dcd7c9;padding-top:16px}
  @page{size:A4;margin:14mm}
  @media print{body{background:#fff}main{padding:0}.item img,.fallback{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
`;

function itemHtml(item) {
  const media = item.image
    ? `<img src="${escapeHtml(item.image)}" alt="">`
    : '<div class="fallback">Sem imagem</div>';
  return [
    '<article class="item">',
    media,
    "<div>",
    `<h3>${escapeHtml(item.name)}</h3>`,
    `<small>REF. ${escapeHtml(item.sku)} · ${escapeHtml(item.category)}</small>`,
    "<dl>",
    `<div><dt>Materiais</dt><dd>${escapeHtml(item.materials)}</dd></div>`,
    `<div><dt>Dimensões</dt><dd>${escapeHtml(item.dimensions)}</dd></div>`,
    `<div><dt>Peso</dt><dd>${escapeHtml(item.weight)}</dd></div>`,
    `<div><dt>Personalização</dt><dd>${escapeHtml(item.personalizable)}</dd></div>`,
    "</dl>",
    "</div>",
    item.quantity
      ? `<span class="qty">${item.quantity}<br>un.</span>`
      : '<span class="qty">Qtd.<br>a definir</span>',
    "</article>",
  ].join("\n");
}

/** HTML autocontido, pronto para imprimir ou salvar em PDF pelo navegador. */
export function renderPresentationHtml(presentation) {
  const view = presentation ?? {};
  const items = Array.isArray(view.items) ? view.items : [];
  const generatedAt =
    view.generatedAt instanceof Date ? view.generatedAt : new Date();
  const selection = items.length
    ? items.map(itemHtml).join("\n")
    : '<p class="empty">Nenhuma peça confirmada no catálogo no momento da geração. Volte à curadoria e refaça a conferência.</p>';
  return [
    "<!doctype html>",
    '<html lang="pt-BR">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>Apresentação do projeto · Promo Brindes Premium</title>",
    `<style>${styles}</style>`,
    "</head>",
    "<body>",
    "<main>",
    "<header>",
    '<p class="eyebrow">Promo Brindes Premium · Apresentação do projeto</p>',
    `<h1>${escapeHtml(view.company || "Sua empresa")}, <em>um gesto que permanece.</em></h1>`,
    `<p class="meta">Preparado em ${escapeHtml(formatDate(generatedAt))} · Contato: ${escapeHtml(view.contact)}</p>`,
    "</header>",
    '<dl class="facts">',
    `<div><dt>Ocasião</dt><dd>${escapeHtml(view.occasion)}</dd></div>`,
    `<div><dt>Data do evento</dt><dd>${escapeHtml(view.eventDate)}</dd></div>`,
    `<div><dt>Recebimento</dt><dd>${escapeHtml(view.delivery)}</dd></div>`,
    `<div><dt>Peças confirmadas</dt><dd>${items.length}</dd></div>`,
    `<div><dt>Unidades somadas</dt><dd>${Number.isFinite(view.totalPieces) ? view.totalPieces : 0}</dd></div>`,
    "</dl>",
    "<h2>Seleção de peças</h2>",
    selection,
    "<footer>",
    `<p>${escapeHtml(view.disclaimer)}</p>`,
    "<p>Valores, técnicas e prazos são confirmados na proposta comercial. Este arquivo é gerado no seu navegador e não é publicado em link público.</p>",
    "</footer>",
    "</main>",
    "</body>",
    "</html>",
  ].join("\n");
}