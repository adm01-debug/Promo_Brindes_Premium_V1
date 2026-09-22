import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const p = JSON.parse(readFileSync("src/lib/plan.json", "utf8"));
assert.equal(p.tasks.length, 200);
assert.equal(p.phases.length, 20);
assert.deepEqual(
  p.tasks.map((t) => t.id),
  Array.from({ length: 200 }, (_, i) => i + 1),
);
assert.equal(new Set(p.tasks.map((t) => t.title)).size, 200);
for (const phase of p.phases)
  assert.equal(p.tasks.filter((t) => t.phase === phase.id).length, 10);
for (const t of p.tasks) {
  for (const key of ["title", "action", "acceptance", "owner", "priority"])
    assert.ok(t[key]?.trim(), `Etapa ${t.id} sem ${key}`);
  assert.ok(["pending", "done"].includes(t.status));
  if (t.status === "done") {
    assert.ok(
      t.evidence && existsSync(t.evidence),
      `Evidência não encontrada na etapa ${t.id}: ${t.evidence}`,
    );
    for (const id of t.dependencies) {
      assert.equal(
        p.tasks[id - 1].status,
        "done",
        `Etapa ${t.id} concluída com dependência ${id} pendente`,
      );
    }
  }
  for (const d of t.dependencies)
    assert.ok(
      p.tasks.some((x) => x.id === d) && d !== t.id,
      `Dependência inválida: ${t.id}`,
    );
}
const visit = (id, trail = new Set()) => {
  assert.ok(!trail.has(id), `Ciclo de dependência em ${id}`);
  const next = new Set(trail);
  next.add(id);
  for (const d of p.tasks[id - 1].dependencies) visit(d, next);
};
for (const t of p.tasks) visit(t.id);
const md = readFileSync("docs/PLANO_200_ETAPAS.md", "utf8");
assert.equal((md.match(/^- \[[ x]\] \*\*\d{3}\./gm) || []).length, 200);
assert.equal(
  (md.match(/^- \[x\] \*\*\d{3}\./gm) || []).length,
  p.tasks.filter((t) => t.status === "done").length,
);
console.log(
  "OK: exatamente 200 etapas, 20 fases, critérios, evidências e dependências válidas.",
);
