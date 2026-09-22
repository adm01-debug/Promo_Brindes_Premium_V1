import { readFileSync, writeFileSync } from "node:fs";
const plan = JSON.parse(readFileSync("src/lib/plan.json", "utf8"));
const complete = plan.tasks.filter((t) => t.status === "done").length;
const lines = [
  "# Promo Brindes Premium — plano de 200 etapas",
  "",
  `Referência: **${plan.version}** · **20 fases × 10 etapas = 200 etapas**.`,
  "",
  `Status de referência: **${complete} concluídas na pesquisa/prévia; ${200 - complete} pendentes**. Conclusão de etapa não representa aprovação comercial, integração em produção ou lançamento.`,
  "",
  "## Como utilizar",
  "",
  "- `[x]`: entrega e critério atendidos no escopo explicitado, com evidência local.",
  "- `[ ]`: etapa a executar ou validar. Não marcar sem atender ao critério.",
  "- P0: necessário para a prontidão da frente correspondente. P1: evolução que pode ser negociada após o núcleo consultivo, conforme aceite do negócio.",
  "- Responsáveis são papéis sugeridos, não pessoas já designadas.",
  "- Janelas de semanas são estimativas relativas ao início aprovado, com trabalho em frentes paralelas; não são promessa de prazo. Fases fora da ordem numérica podem se apoiar entre si.",
  "- Dependências de fase indicam articulação; dependências de etapa são explícitas. Não é necessário executar todas as 200 tarefas em série.",
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
      `  - **Aceite:** ${t.acceptance}`,
      `  - **Evidência:** ${t.evidence ? "`" + t.evidence + "`" : "Pendente; anexar resultado verificável antes de concluir."}`,
    );
    if (t.dependencies.length)
      lines.push(
        `  - **Depende de:** ${t.dependencies.map((i) => String(i).padStart(3, "0")).join(", ")}.`,
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
writeFileSync("docs/PLANO_200_ETAPAS.md", lines.join("\n"));
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
];
const csvRow = (values) =>
  values.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(";");
writeFileSync(
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
        ]),
      ),
    ].join("\r\n"),
);
console.log(
  `Plano gerado: ${plan.tasks.length} etapas, ${complete} concluídas na referência.`,
);
