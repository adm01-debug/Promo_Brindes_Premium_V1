import { readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const plan = JSON.parse(readFileSync("src/lib/plan.json", "utf8"));
const complete = plan.tasks.filter((t) => t.status === "done").length;
const partial = plan.tasks.filter((t) => t.status === "partial").length;
const pending = plan.tasks.filter((t) => t.status === "pending").length;
const labels = {
  done: "Concluída no escopo",
  partial: "Parcial",
  pending: "Sem entrega comprovada",
};
const lines = [
  "# Promo Brindes Premium — plano de 200 etapas",
  "",
  `Referência: **${plan.version}** · **20 fases × 10 etapas = 200 etapas**.`,
  "",
  `Status auditado: **${complete} concluídas no próprio escopo; ${partial} parciais; ${pending} sem entrega comprovada**. São ${partial + pending} etapas abertas. Conclusão isolada não representa aprovação comercial, integração em produção ou lançamento.`,
  "",
  `Revisão do código base: \`${plan.review.reviewedCommit}\`. [Relatório e prioridades](REVISAO_EXAUSTIVA_PLANO.md).`,
  "",
  "## Como utilizar",
  "",
  "- `[x]`: critério próprio comprovado no escopo explicitado, com evidência; dependências abertas ainda impedem prontidão integrada.",
  "- `[ ]` + **Parcial**: existe implementação ou artefato, mas falta parte do aceite ou há defeito reproduzido.",
  "- `[ ]` + **Sem entrega comprovada**: função, atividade ou validação exigida ainda não tem evidência de execução.",
  "- Evidência pode demonstrar uma lacuna. Um arquivo existente não comprova sozinho que o critério foi atendido.",
  "- P0: necessário para a prontidão da frente correspondente. P1: evolução que pode ser negociada após o núcleo consultivo, conforme aceite do negócio.",
  "- Responsáveis são papéis sugeridos, não pessoas já designadas.",
  "- Janelas de semanas são estimativas relativas ao início aprovado, com trabalho em frentes paralelas; não são promessa de prazo. Fases fora da ordem numérica podem se apoiar entre si.",
  "- Dependências representam prontidão integrada. A auditoria atesta o critério próprio de cada entrega e mantém bloqueios visíveis, inclusive quando uma entrega isolada funciona.",
  "- A página `/planejamento` permite filtros, marcação local e exportação. Suas alterações não mudam este arquivo de referência.",
  "- Este plano cobre a solução desejada. A prévia entregue usa oito produtos reais e exporta um briefing; ainda não registra leads no CRM.",
  "",
  "## Portões de conclusão",
  "",
  "| Gate | Critério | Etapas de referência |",
  "|---|---|---|",
  "| G1 · Direção | Pesquisa, posicionamento e escopo validados | 001–040 |",
  "| G2 · Conteúdo | Dados, direitos e informações de compra aprovados | 041–060, 151–160 |",
  "| G3 · Experiência | Descoberta, detalhes e briefing compreensíveis e funcionais | 061–120 |",
  "| G4 · Operação | Contrato público, envio idempotente e continuidade no comercial | 121–150 |",
  "| G5 · Qualidade | Desempenho, acessibilidade, testes e piloto aprovados | 161–190 |",
  "| G6 · Lançamento | Release reversível, operação e monitoramento ativos | 191–200 |",
  "",
  "## Visão das fases",
  "",
  "| Fase | Escopo | Janela indicativa | Responsável sugerido |",
  "|---|---|---|---|",
  ...plan.phases.map(
    (p) =>
      `| ${String(p.id).padStart(2, "0")} | ${p.name} | Semanas ${p.window} | ${p.owner} |`,
  ),
];
for (const p of plan.phases) {
  lines.push(
    "",
    `## Fase ${String(p.id).padStart(2, "0")} — ${p.name}`,
    "",
    `**Responsável:** ${p.owner} · **Prioridade:** ${p.priority} · **Janela:** semanas ${p.window}.`,
    "",
    `**Articulação:** ${p.dependencies.length ? p.dependencies.map((i) => `fase ${String(i).padStart(2, "0")}`).join(", ") : "frente inicial"}.`,
    "",
  );
  for (const t of plan.tasks.filter((t) => t.phase === p.id)) {
    lines.push(
      `- [${t.status === "done" ? "x" : " "}] **${String(t.id).padStart(3, "0")}. ${t.title}.** ${t.action}`,
      `  - **Situação auditada:** ${labels[t.status]}.`,
      `  - **Aceite:** ${t.acceptance}`,
      `  - **Constatação:** ${t.audit.finding}`,
      `  - **Evidências e referências:** ${t.audit.evidence.map((path) => "`" + path + "`").join(", ")}.`,
      `  - **Próxima ação:** ${t.audit.nextAction}`,
    );
    if (t.dependencies.length)
      lines.push(
        `  - **Dependências:** ${t.dependencies.map((i) => `${String(i).padStart(3, "0")} (${labels[plan.tasks[i - 1].status]})`).join(", ")}.`,
      );
    lines.push("");
  }
}
lines.push(
  "---",
  "",
  "Fontes e justificativas: [pesquisa](ESTRATEGIA_E_PESQUISA.md), [auditoria interna](AUDITORIA_PROJETO_INTERNO.md), [arquitetura](ARQUITETURA_E_INTEGRACAO.md), [design system](DESIGN_SYSTEM.md) e [validação](VALIDACAO.md).",
  "",
  "Fonte estruturada: `src/lib/plan.json`. Gerado por `node scripts/generate-plan.mjs`; verificado por `npm run check:plan`.",
  "",
);
const output = (path, contents) => {
  if (process.argv.includes("--check"))
    assert.equal(
      readFileSync(path, "utf8").replace(/\r\n/g, "\n"),
      contents.replace(/\r\n/g, "\n"),
      `${path} desatualizado; execute node scripts/generate-plan.mjs`,
    );
  else writeFileSync(path, contents);
};
output("docs/PLANO_200_ETAPAS.md", lines.join("\n"));
const headers = [
  "id",
  "fase",
  "titulo",
  "acao",
  "criterio_aceite",
  "responsavel",
  "prioridade",
  "status",
  "evidencia",
  "dependencias",
  "status_anterior",
  "natureza",
  "constatacao",
  "proxima_acao",
  "referencias_auditoria",
  "dependencias_diretas_abertas",
];
const csvRow = (values) =>
  values.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(";");
output(
  "docs/PLANO_200_ETAPAS.csv",
  "\ufeff" +
    [
      csvRow(headers),
      ...plan.tasks.map((t) =>
        csvRow([
          t.id,
          t.phase,
          t.title,
          t.action,
          t.acceptance,
          t.owner,
          t.priority,
          t.status,
          t.evidence,
          t.dependencies.join(", "),
          t.audit.previousStatus,
          t.audit.kind,
          t.audit.finding,
          t.audit.nextAction,
          t.audit.evidence.join(", "),
          t.dependencies
            .filter((id) => plan.tasks[id - 1].status !== "done")
            .join(", "),
        ]),
      ),
    ].join("\r\n"),
);
console.log(
  `Plano ${process.argv.includes("--check") ? "conferido" : "gerado"}: ${plan.tasks.length} etapas; ${complete} concluídas, ${partial} parciais, ${pending} sem entrega comprovada.`,
);
