import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("src/app/globals.css", "utf8");
const root = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? "";
const tokens = Object.fromEntries(
  [...root.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map((match) => [
    match[1],
    match[2].trim(),
  ]),
);

for (const token of [
  "black",
  "surface",
  "surface-raised",
  "gold",
  "gold-light",
  "ivory",
  "muted",
  "cta-ink",
  "control-border",
  "product-surface",
  "product-ink",
  "page-gutter",
  "target-primary",
  "motion-fast",
])
  assert.ok(tokens[token], `Token obrigatório ausente: --${token}`);

function luminance(hex) {
  assert.match(hex, /^#[0-9a-f]{6}$/i, `Cor inválida no contrato: ${hex}`);
  const channels = hex
    .slice(1)
    .match(/../g)
    .map((part) => parseInt(part, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const values = [luminance(tokens[foreground]), luminance(tokens[background])];
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
}

const matrix = [
  ["ivory", "black", 4.5],
  ["muted", "black", 4.5],
  ["gold", "black", 4.5],
  ["gold-light", "black", 4.5],
  ["ivory", "surface", 4.5],
  ["muted", "surface", 4.5],
  ["ivory", "surface-raised", 4.5],
  ["muted", "surface-raised", 4.5],
  ["cta-ink", "gold", 4.5],
  ["product-ink", "product-surface", 4.5],
  ["control-border", "black", 3],
];

for (const [foreground, background, minimum] of matrix) {
  const ratio = contrast(foreground, background);
  assert.ok(
    ratio >= minimum,
    `Contraste --${foreground}/--${background}: ${ratio.toFixed(2)} < ${minimum}`,
  );
}

assert.equal(tokens["target-primary"], "44px");
assert.match(
  css,
  /:focus-visible[\s\S]*?outline:\s*2px solid var\(--gold-light\)/,
);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
console.log(
  `UI contract OK: ${matrix.length} contrast pairs and core interaction tokens.`,
);
