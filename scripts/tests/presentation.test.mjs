import assert from "node:assert/strict";
import test from "node:test";
import {
  PRESENTATION_DISCLAIMER,
  buildPresentation,
  renderPresentationHtml,
} from "../../src/lib/presentation.mjs";

const product = {
  id: "p1",
  name: "Caneca de cerâmica",
  sku: "08255",
  category: "Escrita",
  tagline: "Detalhe que fica",
  image: "/images/caneca.webp",
  minimum: 5,
  materials: ["Cerâmica", "Esmalte"],
  dimensions: "9 x 8 cm",
  weightG: 320,
  personalizable: true,
};

const briefing = {
  company: "ACME Ltda",
  name: "Ana Souza",
  occasion: "Confra de fim de ano",
  eventDate: "2026-12-15",
  date: "2026-12-01",
};

test("apresentacao reune dados confirmados e soma as unidades", () => {
  const view = buildPresentation({
    briefing,
    products: [product],
    quantities: { p1: 25 },
    generatedAt: new Date("2026-11-28T12:00:00Z"),
  });
  assert.equal(view.company, "ACME Ltda");
  assert.equal(view.items.length, 1);
  assert.equal(view.items[0].quantity, 25);
  assert.equal(view.items[0].personalizable, "Sim, sob consulta");
  assert.equal(view.items[0].weight, "320 g");
  assert.equal(view.totalPieces, 25);
  assert.equal(view.disclaimer, PRESENTATION_DISCLAIMER);
});

test("quantidade ausente nao vira zero silencioso nem entra na soma", () => {
  const view = buildPresentation({
    briefing,
    products: [product],
    quantities: {},
  });
  assert.equal(view.items[0].quantity, null);
  assert.equal(view.totalPieces, 0);
  const html = renderPresentationHtml(view);
  assert.match(html, /Qtd\.<br>a definir/);
});

test("dado ausente aparece como N\u00e3o informado", () => {
  const view = buildPresentation({
    briefing,
    products: [{ ...product, materials: [], dimensions: null, weightG: null, personalizable: undefined }],
    quantities: { p1: 5 },
  });
  const item = view.items[0];
  assert.equal(item.materials, "Não informado");
  assert.equal(item.dimensions, "Não informado");
  assert.equal(item.weight, "Não informado");
  assert.equal(item.personalizable, "Não informado");
});

test("HTML carrega as pecas, escapa texto do catalogo e nao mostra preco", () => {
  const view = buildPresentation({
    briefing,
    products: [{ ...product, name: 'Caneca <script>alert("x")</script>' }],
    quantities: { p1: 10 },
    generatedAt: new Date("2026-11-28T12:00:00Z"),
  });
  const html = renderPresentationHtml(view);
  assert.ok(html.startsWith("<!doctype html>"));
  assert.match(html, /<html lang="pt-BR">/);
  assert.ok(html.includes("/images/caneca.webp"));
  assert.ok(html.includes("10<br>un."));
  assert.ok(html.includes(PRESENTATION_DISCLAIMER));
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.doesNotMatch(html, /R\$\s*\d/);
  assert.match(html, /@page\{size:A4/);
});

test("selecao vazia tem saida util, nao documento em branco", () => {
  const html = renderPresentationHtml(buildPresentation({ briefing, products: [], quantities: {} }));
  assert.match(html, /Nenhuma peça confirmada no catálogo/);
  assert.match(html, /Peças confirmadas<\/dt><dd>0<\/dd>/);
});

test("imagem ausente usa marcador textual", () => {
  const view = buildPresentation({
    briefing,
    products: [{ ...product, image: null }],
    quantities: { p1: 5 },
  });
  const html = renderPresentationHtml(view);
  assert.ok(html.includes("Sem imagem"));
  assert.ok(!html.includes("<img"));
});