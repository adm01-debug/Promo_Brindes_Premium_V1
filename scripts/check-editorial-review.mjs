import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const products = JSON.parse(readFileSync("src/lib/products.json", "utf8"));
const register = JSON.parse(
  readFileSync("docs/editorial/product-review.json", "utf8"),
);
const rows = register.items;
const sourceDigest = (product) =>
  createHash("sha256").update(JSON.stringify(product)).digest("hex");
const fail = (message) => {
  console.error(`Revisão editorial inválida: ${message}`);
  process.exitCode = 1;
};

if (!Array.isArray(rows) || rows.length !== products.length) {
  fail("o inventário precisa cobrir cada produto do catálogo uma vez.");
} else {
  const byId = new Map(products.map((product) => [product.id, product]));
  const seen = new Set();
  for (const row of rows) {
    const product = byId.get(row.productId);
    if (!product || seen.has(row.productId)) {
      fail("identificador ausente ou duplicado.");
      continue;
    }
    seen.add(row.productId);
    if (
      row.sku !== product.sku ||
      row.image !== product.image ||
      row.sourceDate !== product.sourceDate ||
      row.sourceDigest !== sourceDigest(product)
    )
      fail(
        `${product.sku}: fonte, imagem ou SKU mudou; a revisão precisa ser refeita.`,
      );
    if (!["pending", "approved", "rejected"].includes(row.status))
      fail(`${product.sku}: estado de revisão desconhecido.`);
    if (row.status === "approved") {
      if (
        typeof row.reviewer !== "string" ||
        row.reviewer.trim().length < 3 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(row.reviewedAt ?? "") ||
        row.reviewedSourceDate !== product.sourceDate ||
        row.copyApproved !== true ||
        ["materialEvidence", "minimumEvidence", "imageRightsEvidence"].some(
          (field) =>
            typeof row[field] !== "string" || row[field].trim().length < 10,
        )
      )
        fail(
          `${product.sku}: aprovação sem responsável, data, texto ou evidências.`,
        );
    }
  }
  const pending = rows.filter((row) => row.status !== "approved");
  if (process.argv.includes("--ready") && pending.length)
    fail(`${pending.length} produtos ainda precisam de aprovação editorial.`);
  if (!process.exitCode)
    console.log(
      `Inventário editorial válido: ${rows.length} produtos; ${rows.length - pending.length} aprovados, ${pending.length} sem aprovação.`,
    );
}
