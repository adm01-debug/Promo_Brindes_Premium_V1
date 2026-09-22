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
export default function PlanDashboard() {
  const [checked, setChecked] = useState<Record<string, boolean>>(baseline);
  const [phase, setPhase] = useState(0);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const value: unknown = JSON.parse(
        localStorage.getItem("promo-premium-plan-v1") ?? "null",
      );
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const state = { ...baseline };
        for (const [id, done] of Object.entries(value))
          if (id in baseline && typeof done === "boolean") state[id] = done;
        setChecked(state);
      }
    } catch {
      /* Local state is optional. */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("promo-premium-plan-v1", JSON.stringify(checked));
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
          (status === "all" ||
            (status === "done" ? checked[t.id] : !checked[t.id])) &&
          normalize(`${t.id} ${t.title} ${t.action} ${t.acceptance}`).includes(
            normalize(search),
          ),
      ),
    [phase, status, search, checked],
  );
  function exportPlan() {
    const lines = [
      "# Promo Brindes Premium — 200 etapas",
      "",
      `Referência: ${plan.version}. Progresso deste navegador: ${count}/200.`,
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
          `  - Evidência de referência: ${t.evidence || "Pendente de execução."}`,
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
              {count}
              <span>/ 200</span>
            </strong>
            <p>etapas marcadas</p>
          </div>
          <div>
            <strong>20</strong>
            <p>fases de trabalho</p>
          </div>
          <div>
            <strong>
              {Math.round(count / 2)}
              <span>%</span>
            </strong>
            <p>progresso deste navegador</p>
          </div>
        </div>
        <progress
          value={count}
          max={200}
          aria-label={`${count} de 200 etapas marcadas`}
        />
        <p className="plan-note">
          Referência de 20.09.2026. Marcações adicionais ficam apenas neste
          navegador. Uma etapa concluída na prévia não significa integração ou
          lançamento em produção.
        </p>
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
            <option value="pending">A concluir</option>
            <option value="done">Concluídas</option>
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
                  plan.tasks.filter((t) => t.phase === p.id && checked[t.id])
                    .length
                }
                /10
              </span>
            </div>
            <div className="plan-task-list">
              {visible
                .filter((t) => t.phase === p.id)
                .map((t) => (
                  <div
                    className={`plan-task ${checked[t.id] ? "completed" : ""}`}
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
                        <strong>{t.title}</strong>
                        <ChevronDown size={17} />
                      </summary>
                      <div className="task-body">
                        <p>{t.action}</p>
                        <p>
                          <b>Critério de conclusão</b>
                          {t.acceptance}
                        </p>
                        <p>
                          <b>Evidência de referência</b>
                          {t.evidence ||
                            "A produzir durante a execução. Não marcar como concluída sem verificar o aceite."}
                        </p>
                        {t.dependencies.length > 0 && (
                          <p>
                            <b>Dependências de etapa</b>
                            {t.dependencies
                              .map((i) => `#${String(i).padStart(3, "0")}`)
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
