"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Download,
  Search,
} from "lucide-react";
import plan from "@/lib/plan.json";
import { downloadText, normalize } from "@/lib/catalog";

const baseline = Object.fromEntries(
  plan.tasks.map((t) => [t.id, t.status === "done"]),
);
const storageKey = "promo-premium-plan-v2";
const statusLabels: Record<string, string> = {
  done: "Concluída no escopo",
  partial: "Parcial",
  pending: "Sem entrega comprovada",
};
const auditedDone = plan.tasks.filter((t) => t.status === "done").length;
const auditedPartial = plan.tasks.filter((t) => t.status === "partial").length;
const auditedPending = plan.tasks.filter((t) => t.status === "pending").length;
export default function PlanDashboard() {
  const [checked, setChecked] = useState<Record<string, boolean>>(baseline);
  const [phase, setPhase] = useState(0);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const value: unknown = JSON.parse(
        localStorage.getItem(storageKey) ?? "null",
      );
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const saved = value as Record<string, unknown>;
        if (
          saved.review === plan.review.id &&
          saved.overrides &&
          typeof saved.overrides === "object" &&
          !Array.isArray(saved.overrides)
        ) {
          const state = { ...baseline };
          for (const [id, done] of Object.entries(saved.overrides))
            if (Object.hasOwn(baseline, id) && typeof done === "boolean")
              state[id] = done;
          setChecked(state);
        }
      }
    } catch {
      /* Local state is optional. */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      const overrides = Object.fromEntries(
        Object.entries(checked).filter(([id, done]) => done !== baseline[id]),
      );
      localStorage.setItem(
        storageKey,
        JSON.stringify({ review: plan.review.id, overrides }),
      );
    } catch {
      /* Storage may be disabled. */
    }
  }, [checked, loaded]);
  const count = Object.values(checked).filter(Boolean).length;
  const visible = useMemo(
    () =>
      plan.tasks.filter(
        (t) =>
          (!phase || t.phase === phase) &&
          (status === "all" || status === t.status) &&
          normalize(
            `${t.id} ${t.title} ${t.action} ${t.acceptance} ${t.audit.finding} ${t.audit.nextAction}`,
          ).includes(normalize(search)),
      ),
    [phase, status, search],
  );
  function exportPlan() {
    const lines = [
      "# Promo Brindes Premium — 200 etapas",
      "",
      `Referência: ${plan.version}. Progresso deste navegador: ${count}/200.`,
      `Auditoria: ${auditedDone} concluídas no escopo, ${auditedPartial} parciais, ${auditedPending} sem entrega comprovada.`,
      "",
      "Marcações locais não substituem evidências de aceite.",
    ];
    for (const p of plan.phases) {
      lines.push(
        "",
        `## Fase ${p.id}: ${p.name}`,
        "",
        `Responsável: ${p.owner}. Prioridade: ${p.priority}. Janela indicativa: semanas ${p.window}.`,
        "",
      );
      for (const t of plan.tasks.filter((t) => t.phase === p.id))
        lines.push(
          `- [${checked[t.id] ? "x" : " "}] **${String(t.id).padStart(3, "0")}. ${t.title}** — ${t.action}`,
          `  - Aceite: ${t.acceptance}`,
          `  - Situação auditada: ${statusLabels[t.status]}`,
          `  - Constatação: ${t.audit.finding}`,
          `  - Referências: ${t.audit.evidence.join(", ")}`,
          `  - Próxima ação: ${t.audit.nextAction}`,
          `  - Dependências: ${t.dependencies.map((id) => `#${id} (${statusLabels[plan.tasks[id - 1].status]})`).join(", ") || "Nenhuma"}`,
        );
    }
    downloadText(
      "plano-200-etapas-promo-premium.md",
      lines.join("\n"),
      "text/markdown;charset=utf-8",
    );
  }
  return (
    <main className="plan-page">
      <header className="plan-header">
        <Link href="/" className="text-button">
          <ArrowLeft size={16} /> Ver a vitrine
        </Link>
        <span className="eyebrow">WORKSPACE · ESTRATÉGIA & EXECUÇÃO</span>
        <button className="button button-outline" onClick={exportPlan}>
          <Download size={16} /> Exportar checklist
        </button>
      </header>
      <section className="plan-intro">
        <p className="eyebrow">PROMO BRINDES PREMIUM · PLANO MESTRE</p>
        <h1>
          Uma visão extraordinária.
          <br />
          <em>200 passos concretos.</em>
        </h1>
        <p>
          Da pesquisa ao lançamento. Cada etapa tem uma entrega, um critério de
          aceite e um responsável sugerido.
        </p>
        <div className="plan-metrics">
          <div>
            <strong>
              {auditedDone}
              <span>/ 200</span>
            </strong>
            <p>concluídas no escopo auditado</p>
          </div>
          <div>
            <strong>{auditedPartial}</strong>
            <p>parcialmente implementadas</p>
          </div>
          <div>
            <strong>{auditedPending}</strong>
            <p>sem entrega comprovada</p>
          </div>
        </div>
        <progress
          value={auditedDone}
          max={200}
          aria-label={`${auditedDone} de 200 critérios comprovados no próprio escopo`}
        />
        <p className="plan-note">
          Revisão de {plan.version.split("-").reverse().join(".")}. Cada
          situação auditada corresponde ao critério próprio da etapa.
          Dependências abertas ainda impedem a prontidão integrada. Os filtros
          usam a auditoria; marcações locais não alteram estes resultados nem
          aprovam lançamento.
        </p>
        <p className="plan-note" data-testid="local-plan-progress">
          Acompanhamento deste navegador: {count}/200 marcadas. Marcações de
          revisões anteriores não são reaplicadas automaticamente.
        </p>
        <button
          className="text-button"
          onClick={() => setChecked({ ...baseline })}
        >
          Restaurar acompanhamento da auditoria
        </button>
      </section>
      <div className="plan-filters">
        <label className="plan-search">
          <Search size={17} />
          <span className="sr-only">Buscar etapa</span>
          <input
            type="search"
            placeholder="Buscar etapa, entrega ou critério…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Filtrar fase</span>
          <select
            value={phase}
            onChange={(e) => setPhase(Number(e.target.value))}
          >
            <option value={0}>Todas as fases</option>
            {plan.phases.map((p) => (
              <option key={p.id} value={p.id}>
                {String(p.id).padStart(2, "0")} · {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filtrar status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Todos os status</option>
            <option value="done">Concluídas no escopo</option>
            <option value="partial">Parciais</option>
            <option value="pending">Sem entrega comprovada</option>
          </select>
        </label>
      </div>
      <p className="plan-result" role="status">
        {visible.length} de 200 etapas · Clique em uma etapa para ver seus
        critérios.
      </p>
      {plan.phases
        .filter((p) => visible.some((t) => t.phase === p.id))
        .map((p) => (
          <section
            className="plan-phase"
            key={p.id}
            aria-labelledby={`phase-${p.id}`}
          >
            <div className="phase-heading">
              <span className="phase-number">
                {String(p.id).padStart(2, "0")}
              </span>
              <div>
                <p className="eyebrow">
                  {p.priority} · {p.owner}
                </p>
                <h2 id={`phase-${p.id}`}>{p.name}</h2>
                <p>
                  Semanas {p.window} ·{" "}
                  {p.dependencies.length
                    ? `Articulação com fases ${p.dependencies.join(", ")}`
                    : "Frente inicial"}
                </p>
              </div>
              <span className="phase-completion">
                {
                  plan.tasks.filter(
                    (t) => t.phase === p.id && t.status === "done",
                  ).length
                }
                /10
              </span>
            </div>
            <div className="plan-task-list">
              {visible
                .filter((t) => t.phase === p.id)
                .map((t) => (
                  <div
                    className={`plan-task ${t.status === "done" ? "completed" : ""}`}
                    key={t.id}
                  >
                    <label className="task-checkbox">
                      <input
                        type="checkbox"
                        checked={!!checked[t.id]}
                        onChange={(e) =>
                          setChecked((prev) => ({
                            ...prev,
                            [t.id]: e.target.checked,
                          }))
                        }
                        aria-label={`Concluir etapa ${t.id}: ${t.title}`}
                      />
                      <span aria-hidden="true">
                        {checked[t.id] && <Check size={15} />}
                      </span>
                    </label>
                    <details>
                      <summary>
                        <span className="task-number">
                          {String(t.id).padStart(3, "0")}
                        </span>
                        <strong>
                          {t.title}
                          <span
                            className={`task-audit-status audit-${t.status}`}
                          >
                            {statusLabels[t.status]}
                          </span>
                        </strong>
                        <ChevronDown size={17} />
                      </summary>
                      <div className="task-body">
                        <p>{t.action}</p>
                        <p>
                          <b>Critério de conclusão</b>
                          {t.acceptance}
                        </p>
                        <p>
                          <b>Constatação da auditoria</b>
                          {t.audit.finding}
                        </p>
                        <p>
                          <b>Evidências e referências</b>
                          {t.audit.evidence.join(" · ")}
                        </p>
                        <p>
                          <b>Próxima ação</b>
                          {t.audit.nextAction}
                        </p>
                        {t.dependencies.length > 0 && (
                          <p>
                            <b>Dependências de etapa</b>
                            {t.dependencies
                              .map(
                                (i) =>
                                  `#${String(i).padStart(3, "0")} (${statusLabels[plan.tasks[i - 1].status]})`,
                              )
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    </details>
                  </div>
                ))}
            </div>
          </section>
        ))}
      {visible.length === 0 && (
        <div className="empty-state">
          <h2>Nenhuma etapa nesta combinação.</h2>
          <button
            className="button button-gold"
            onClick={() => {
              setPhase(0);
              setStatus("all");
              setSearch("");
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}
      <footer className="plan-footer">
        <p>
          As janelas são estimativas de organização para trabalho em frentes
          paralelas, não compromissos de prazo. Validação comercial, dados,
          mídia e integração determinam a prontidão.
        </p>
        <Link href="/">
          Explorar o conceito <ArrowUpRight size={16} />
        </Link>
      </footer>
    </main>
  );
}
