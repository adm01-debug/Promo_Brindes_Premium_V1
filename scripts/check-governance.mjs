import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const governancePath = "docs/governance/release-governance.json";
const governance = JSON.parse(readFileSync(governancePath, "utf8"));
const envExample = readFileSync(".env.example", "utf8");

assert.equal(governance.decision, "defer-commercial-launch");
assert.equal(governance.releaseMode, "technical-preview");
assert.equal(governance.publicIndexing, false);
assert.equal(governance.commercialDataCollection, false);
assert.equal(governance.analytics, false);
assert.equal(governance.fileUpload, false);
assert.equal(governance.publicPricing, "quote-only");
assert.equal(governance.catalogExpansion, false);
assert.equal(governance.canonicalIntake, "premium_briefings");
assert.match(envExample, /^PROMO_PREMIUM_INDEXABLE=false$/m);
assert.match(envExample, /^BRIEFING_DELIVERY_ENABLED=false$/m);

const requiredGateIds = [
  "legal-controller",
  "privacy-channel",
  "privacy-policy",
  "content-rights",
  "commercial-product-review",
  "named-commercial-owner",
  "approved-crm-receiver",
  "failure-reconciliation",
  "isolated-staging",
  "seller-pilot",
  "buyer-pilot",
  "commercial-domain",
  "rollback-rehearsal",
];
assert.deepEqual(
  governance.requiredGates.map((gate) => gate.id),
  requiredGateIds,
);
for (const gate of governance.requiredGates) {
  assert.ok(["blocked", "proven"].includes(gate.state));
  if (gate.evidence) assert.ok(existsSync(gate.evidence), gate.evidence);
}
assert.ok(governance.decisions.length >= 8);
assert.equal(
  new Set(governance.decisions.map((item) => item.id)).size,
  governance.decisions.length,
);
for (const item of governance.decisions) {
  assert.ok(item.subject?.trim());
  assert.ok(item.choice?.trim());
  assert.ok(item.reopenWhen?.trim());
}

console.log(
  `OK: decisão ${governance.decision}; ${governance.requiredGates.length} gates explícitos; coleta, indexação, analytics, upload e expansão bloqueados por padrão.`,
);
