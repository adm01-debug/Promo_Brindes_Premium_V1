"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type {
  ConsoleActionBody,
  ConsoleBriefing,
  ConsoleBriefingStatus,
  ConsoleCatalogItem,
  ConsoleLimit,
  ConsoleStatus,
} from "@/lib/operations-types";
import { RATE_LIMIT_MAX_ATTEMPTS } from "@/lib/console-validation.mjs";

type Tab = "situacao" | "catalogo" | "briefings" | "limites";
type Feedback = { tipo: "ok" | "erro"; texto: string } | null;

const tabs: { id: Tab; label: string }[] = [
  { id: "situacao", label: "Situação" },
  { id: "catalogo", label: "Catálogo" },
  { id: "briefings", label: "Leads" },
  { id: "limites", label: "Limites" },
];

const deliveryLabels: Record<string, string> = {
  pending: "Na fila",
  delivering: "Em envio",
  delivered: "Entregue",
  failed: "Falhou",
};

const statusLabels: Record<string, string> = {
  received: "Recebido",
  qualified: "Qualificado",
  closed: "Encerrado",
};

const statusOptions: { value: ConsoleBriefingStatus; label: string }[] = [
  { value: "received", label: "Recebido" },
  { value: "qualified", label: "Qualificado" },
  { value: "closed", label: "Encerrado" },
];

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/** Colunas `date` (sem hora) não podem passar por fuso: o dia é o texto. */
function formatDay(value: string | null) {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return formatDate(value);
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIso(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function materialLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function briefingPieces(items: unknown) {
  return Array.isArray(items) ? `${items.length} peça(s)` : "—";
}

function briefingItemsText(items: unknown) {
  if (!Array.isArray(items) || !items.length) return "Sem peças registradas.";
  return items
    .map((entry) => {
      if (!entry || typeof entry !== "object") return String(entry);
      const row = entry as Record<string, unknown>;
      const name = typeof row.name === "string" ? row.name : "Peça";
      const sku = typeof row.sku === "string" ? ` (${row.sku})` : "";
      const quantity =
        typeof row.quantity === "number" ? ` × ${row.quantity}` : "";
      return `${name}${sku}${quantity}`;
    })
    .join("\n");
}

export default function OperationsConsole() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [token, setToken] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("situacao");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<ConsoleStatus | null>(null);
  const [catalog, setCatalog] = useState<ConsoleCatalogItem[] | null>(null);
  const [briefings, setBriefings] = useState<ConsoleBriefing[] | null>(null);
  const [limits, setLimits] = useState<ConsoleLimit[] | null>(null);

  const load = useCallback(async (scope: Tab) => {
    setBusy(true);
    setLoadError(null);
    try {
      const response = await fetch(`/api/operacoes/dados?escopo=${scope}`, {
        cache: "no-store",
      });
      if (response.status === 401) {
        setAuthed(false);
        return;
      }
      const body = (await response.json()) as {
        dados?: unknown;
        mensagem?: string;
      };
      if (!response.ok) {
        setAuthed(true);
        setLoadError(body.mensagem ?? "Não foi possível carregar os dados.");
        return;
      }
      setAuthed(true);
      if (scope === "situacao") setStatus(body.dados as ConsoleStatus);
      if (scope === "catalogo") setCatalog(body.dados as ConsoleCatalogItem[]);
      if (scope === "briefings")
        setBriefings(body.dados as ConsoleBriefing[]);
      if (scope === "limites") setLimits(body.dados as ConsoleLimit[]);
    } catch {
      setLoadError("Falha de rede ao consultar o console.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load("situacao");
  }, [load]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setLoginError(null);
    try {
      const response = await fetch("/api/operacoes/sessao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        setLoginError(
          response.status === 401
            ? "Token incorreto."
            : response.status === 403
              ? "O navegador enviou a requisição de outra origem. Recarregue a página e tente de novo."
              : response.status === 404
                ? "O console está desligado neste ambiente."
                : `Não foi possível abrir a sessão (HTTP ${response.status}).`,
        );
        return;
      }
      setToken("");
      await load(tab);
    } catch {
      setLoginError("Falha de rede ao entrar.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/operacoes/sessao", { method: "DELETE" });
    setAuthed(false);
    setStatus(null);
    setCatalog(null);
    setBriefings(null);
    setLimits(null);
    setFeedback(null);
  }

  async function run(action: ConsoleActionBody) {
    setBusy(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/operacoes/acoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      if (response.status === 401) {
        setAuthed(false);
        return;
      }
      const body = (await response.json()) as { mensagem?: string };
      if (!response.ok) {
        setFeedback({
          tipo: "erro",
          texto: body.mensagem ?? "A ação não foi concluída.",
        });
        return;
      }
      setFeedback({ tipo: "ok", texto: body.mensagem ?? "Ação concluída." });
      await load(tab);
    } catch {
      setFeedback({ tipo: "erro", texto: "Falha de rede ao gravar." });
    } finally {
      setBusy(false);
    }
  }

  function selectTab(next: Tab) {
    setTab(next);
    setFeedback(null);
    void load(next);
  }

  if (authed === null)
    return (
      <main className="console-shell">
        <div className="console-frame">
          <p className="console-muted">Carregando console…</p>
        </div>
      </main>
    );

  if (!authed)
    return (
      <main className="console-shell">
        <div className="console-frame console-login">
          <h1>Console de operação</h1>
          <p className="console-muted">
            Área interna do dono do site. Informe o token configurado para
            abrir a sessão.
          </p>
          <form onSubmit={login}>
            <label className="console-field" htmlFor="console-token">
              Token de acesso
              <input
                id="console-token"
                type="password"
                autoComplete="current-password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                required
              />
            </label>
            {loginError ? (
              <p className="console-feedback" data-tone="erro" role="alert">
                {loginError}
              </p>
            ) : null}
            <button
              className="console-button"
              data-variant="primary"
              type="submit"
              disabled={busy || !token.trim()}
            >
              Entrar
            </button>
          </form>
        </div>
      </main>
    );

  return (
    <main className="console-shell">
      <div className="console-frame">
        <header className="console-top">
          <div>
            <h1>Console de operação</h1>
            <p>
              Catálogo, ficha técnica, publicação, leads e limites de envio do
              banco premium — tudo o que antes só existia em linha de comando.
            </p>
          </div>
          <div className="console-actions">
            <button
              className="console-button"
              type="button"
              onClick={() => void load(tab)}
              disabled={busy}
            >
              {busy ? "Carregando…" : "Atualizar"}
            </button>
            <button className="console-button" type="button" onClick={logout}>
              Sair
            </button>
          </div>
        </header>

        <div className="console-tabs" role="tablist" aria-label="Seções">
          {tabs.map((entry) => (
            <button
              key={entry.id}
              className="console-tab"
              type="button"
              role="tab"
              aria-selected={tab === entry.id}
              onClick={() => selectTab(entry.id)}
            >
              {entry.label}
            </button>
          ))}
        </div>

        {feedback ? (
          <p
            className="console-feedback"
            data-tone={feedback.tipo}
            role="status"
          >
            {feedback.texto}
          </p>
        ) : null}
        {loadError ? (
          <p className="console-note" role="alert">
            {loadError}
          </p>
        ) : null}

        {tab === "situacao" ? <StatusPanel status={status} /> : null}
        {tab === "catalogo" ? (
          <CatalogPanel items={catalog} busy={busy} onRun={run} />
        ) : null}
        {tab === "briefings" ? (
          <BriefingsPanel
            items={briefings}
            status={status}
            busy={busy}
            onRun={run}
          />
        ) : null}
        {tab === "limites" ? (
          <LimitsPanel items={limits} busy={busy} onRun={run} />
        ) : null}
      </div>
    </main>
  );
}

function StatusPanel({ status }: { status: ConsoleStatus | null }) {
  if (!status) return <p className="console-muted">Consultando o banco…</p>;
  const counts = status.contagens;
  const replication = status.replicacao;
  const maintenance = status.manutencao;
  const manual = status.manutencaoManual;
  const replicationState = !replication
    ? "Indisponível"
    : !replication.registrada
      ? "Sem registro"
      : replication.status === "failed"
        ? "Falhou na última tentativa"
        : replication.atrasada
          ? "Atrasada"
          : "Em dia";
  const maintenanceState = !maintenance
    ? "Indisponível"
    : !maintenance.registrada
      ? "Sem registro"
      : maintenance.status === "failed"
        ? "Falhou na última execução"
        : maintenance.atrasada
          ? "Atrasada"
          : "Em dia";
  return (
    <>
      <div className="console-cards">
        <section className="console-card">
          <h2>Banco premium</h2>
          <strong>{status.banco ? "Conectado" : "Sem configuração"}</strong>
          <p className="console-muted">Verificado em {formatDate(status.verificadoEm)}</p>
        </section>
        <section className="console-card">
          <h2>Envio ao comercial</h2>
          <strong>{status.entrega.habilitada ? "Ligado" : "Desligado"}</strong>
          <p className="console-muted">
            {status.entrega.habilitada
              ? "Os leads saem do banco assim que chegam."
              : status.entrega.motivo}
          </p>
        </section>
        <section className="console-card">
          <h2>Catálogo</h2>
          <ul>
            <li>
              Peças no banco <b>{counts ? counts.itens : "—"}</b>
            </li>
            <li>
              Publicadas <b>{counts ? counts.publicados : "—"}</b>
            </li>
          </ul>
        </section>
        <section className="console-card">
          <h2>Leads</h2>
          <ul>
            <li>
              Total <b>{counts ? counts.leads : "—"}</b>
            </li>
            <li>
              Na fila <b>{counts ? counts.leadsNaFila : "—"}</b>
            </li>
            <li>
              Com falha <b>{counts ? counts.leadsComFalha : "—"}</b>
            </li>
            <li>
              Limites ativos <b>{counts ? counts.limites : "—"}</b>
            </li>
          </ul>
        </section>
        <section className="console-card">
          <h2>Réplica da gestão</h2>
          <strong>{replicationState}</strong>
          <ul>
            <li>
              Último sucesso{" "}
              <b>{formatDate(replication?.ultimoSucessoEm ?? null)}</b>
            </li>
            <li>
              Última tentativa{" "}
              <b>{formatDate(replication?.ultimaTentativaEm ?? null)}</b>
            </li>
            <li>
              Itens conferidos <b>{replication?.curados ?? "—"}</b>
            </li>
            <li>
              Produtos ativos na gestão <b>{replication?.origem ?? "—"}</b>
            </li>
          </ul>
        </section>
        <section className="console-card">
          <h2>Limpeza automática</h2>
          <strong>{maintenanceState}</strong>
          <ul>
            <li>
              Última execução{" "}
              <b>{formatDate(maintenance?.ultimaExecucaoEm ?? null)}</b>
            </li>
            <li>
              Último sucesso{" "}
              <b>{formatDate(maintenance?.ultimoSucessoEm ?? null)}</b>
            </li>
            <li>
              Removidos na última execução <b>{maintenance?.removidos ?? "—"}</b>
            </li>
            <li>
              Execuções registradas <b>{maintenance?.execucoes ?? "—"}</b>
            </li>
            <li>
              Última limpeza manual{" "}
              <b>{formatDate(manual?.ultimaExecucaoEm ?? null)}</b>
            </li>
          </ul>
        </section>
      </div>
      {replication?.status === "failed" ? (
        <p className="console-note">
          {`A replicação falhou na última tentativa: ${replication.erro ?? "sem motivo registrado"}.`}{" "}
          {replication.atrasada
            ? replication.horasDesdeSucesso === null
              ? "Ainda não há replicação bem-sucedida registrada; a vitrine pode estar exibindo dados desatualizados."
              : `A última replicação bem-sucedida foi há ${replication.horasDesdeSucesso} hora(s); a vitrine pode estar exibindo nome ou preço antigo.`
            : "Enquanto isso, os dados publicados continuam os da última execução boa."}{" "}
          A sincronização roda no workflow do catálogo e grava aqui o resultado
          de cada tentativa.
        </p>
      ) : replication?.atrasada ? (
        <p className="console-note">
          {replication.horasDesdeSucesso === null
            ? "Ainda não há replicação bem-sucedida registrada; a vitrine pode estar exibindo dados desatualizados."
            : `A última replicação bem-sucedida foi há ${replication.horasDesdeSucesso} hora(s); a vitrine pode estar exibindo nome ou preço antigo.`}{" "}
          Enquanto isso, os dados publicados continuam os da última execução
          boa. A sincronização roda no workflow do catálogo e grava aqui o
          resultado de cada tentativa.
        </p>
      ) : null}
      {replication ? (
        !replication.registrada ? (
          <p className="console-note">
            Nenhuma tentativa de replicação registrada desde que este aviso
            entrou no ar. Rode a sincronização do catálogo para gravar a
            primeira marca e passar a acompanhar a atualização da vitrine por
            aqui.
          </p>
        ) : null
      ) : status.banco ? (
        <p className="console-note">
          Não foi possível consultar o histórico de replicação no banco premium
          agora, então este card pode estar incompleto. Os itens publicados
          continuam os da última execução boa.
        </p>
      ) : null}
      {!status.entrega.habilitada ? (
        <p className="console-note">
          Nenhum lead consegue sair do banco enquanto o envio ao comercial
          estiver desligado. Esta tela mostra o estado real e permite voltar um
          lead com falha para a fila, mas o envio só acontece quando o receptor
          estiver configurado.
        </p>
      ) : null}
      {maintenance?.status === "failed" ? (
        <p className="console-note">
          {`A limpeza automática dos limites falhou na última execução: ${maintenance.erro ?? "sem motivo registrado"}.`}{" "}
          {maintenance.atrasada
            ? "Enquanto ela não volta a rodar, os registros vencidos se acumulam na tabela de limites — o bloqueio de envio não, porque ele conta só os últimos dez minutos."
            : "A última execução boa continua valendo; o próximo ciclo tenta de novo em até cinco minutos."}{" "}
          A limpeza roda a cada cinco minutos pelo agendador do banco.
        </p>
      ) : maintenance?.atrasada ? (
        <p className="console-note">
          {`A limpeza automática dos limites deveria rodar a cada cinco minutos e a última execução foi há ${maintenance.minutosDesdeExecucao ?? "?"} minuto(s).`}{" "}
          O agendador do banco pode estar parado; até voltar, os registros
          vencidos se acumulam na tabela de limites, sem bloquear nenhum envio
          além dos últimos dez minutos — o limite conta só essa janela.
          A limpeza também pode ser disparada na mão em Limpar limites agora, na
          aba Limites.
        </p>
      ) : null}
      {maintenance && !maintenance.registrada ? (
        <p className="console-note">
          Nenhuma execução da limpeza automática registrada desde que este aviso
          entrou no ar. Ela roda a cada cinco minutos pelo agendador do banco; se
          este card continuar vazio, o agendador não está rodando.
        </p>
      ) : null}
      {manual?.falhou ? (
        <p className="console-note">
          {`A última limpeza manual dos limites falhou: ${manual.erro ?? "sem motivo registrado"}.`}{" "}
          Nada foi removido nessa rodada e o estado acima continua sendo o do
          agendador do banco; os registros vencidos seguem na aba Limites.
        </p>
      ) : null}
      {!maintenance && status.banco ? (
        <p className="console-note">
          Não foi possível consultar o histórico da limpeza automática agora,
          então este card pode estar incompleto. Os limites continuam valendo
          exatamente como estão gravados no banco.
        </p>
      ) : null}
    </>
  );
}

function CatalogPanel({
  items,
  busy,
  onRun,
}: {
  items: ConsoleCatalogItem[] | null;
  busy: boolean;
  onRun: (action: ConsoleActionBody) => Promise<void>;
}) {
  if (!items) return <p className="console-muted">Consultando o catálogo…</p>;
  if (!items.length)
    return (
      <p className="console-note">
        Nenhuma peça no banco premium. Rode a sincronização do catálogo para
        trazer a fonte read-only.
      </p>
    );
  return (
    <div className="console-table-wrap">
      <table className="console-table">
        <thead>
          <tr>
            <th scope="col">Peça</th>
            <th scope="col">Situação</th>
            <th scope="col">Janela</th>
            <th scope="col">Ficha técnica</th>
            <th scope="col">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <CatalogRow
              key={`${item.id}-${item.updated_at}`}
              item={item}
              busy={busy}
              onRun={onRun}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CatalogRow({
  item,
  busy,
  onRun,
}: {
  item: ConsoleCatalogItem;
  busy: boolean;
  onRun: (action: ConsoleActionBody) => Promise<void>;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [publicationOpen, setPublicationOpen] = useState(false);
  const [materials, setMaterials] = useState(item.materials.join("\n"));
  const [dimensions, setDimensions] = useState(item.dimensions ?? "");
  const [weight, setWeight] = useState(
    item.weight_g === null ? "" : String(item.weight_g),
  );
  const [packaging, setPackaging] = useState(item.packaging ?? "");
  const [published, setPublished] = useState(item.published);
  const [from, setFrom] = useState(toLocalInput(item.published_from));
  const [until, setUntil] = useState(toLocalInput(item.published_until));
  const [confirmSku, setConfirmSku] = useState("");

  return (
    <tr>
      <td>
        <strong>{item.name}</strong>
        <p className="console-muted">
          {item.sku} · ordem {item.editorial_order} · atualizado em{" "}
          {formatDate(item.updated_at)}
        </p>
      </td>
      <td>
        <span
          className="console-badge"
          data-state={item.published ? "live" : "out"}
        >
          {item.published ? "No ar" : "Fora do ar"}
        </span>
      </td>
      <td className="console-muted">
        {item.published_from || item.published_until
          ? `${formatDate(item.published_from)} → ${formatDate(
              item.published_until,
            )}`
          : "Sem janela"}
      </td>
      <td>
        {item.materials.length ? (
          <ul className="console-details">
            {item.materials.map((material) => (
              <li key={`${item.id}-${material}`}>{material}</li>
            ))}
          </ul>
        ) : (
          <span className="console-muted">Sem ficha</span>
        )}
        <p className="console-muted">
          {item.dimensions ?? "medidas pendentes"} ·{" "}
          {item.weight_g === null ? "peso pendente" : `${item.weight_g} g`} ·{" "}
          {item.packaging ?? "embalagem pendente"}
        </p>
        {sheetOpen ? (
          <form
            className="console-form"
            onSubmit={(event) => {
              event.preventDefault();
              void onRun({
                acao: "catalogo-ficha",
                id: item.id,
                materials: materialLines(materials),
                dimensions,
                weightG: weight,
                packaging,
                expectedUpdatedAt: item.updated_at,
              });
            }}
          >
            <label className="console-field">
              Materiais (um por linha, até 5)
              <textarea
                value={materials}
                onChange={(event) => setMaterials(event.target.value)}
              />
            </label>
            <div className="console-form-grid">
              <label className="console-field">
                Medidas
                <input
                  value={dimensions}
                  maxLength={80}
                  onChange={(event) => setDimensions(event.target.value)}
                />
              </label>
              <label className="console-field">
                Peso em gramas
                <input
                  value={weight}
                  inputMode="numeric"
                  onChange={(event) => setWeight(event.target.value)}
                />
              </label>
              <label className="console-field">
                Embalagem
                <input
                  value={packaging}
                  maxLength={120}
                  onChange={(event) => setPackaging(event.target.value)}
                />
              </label>
            </div>
            <div className="console-actions">
              <button
                className="console-button"
                data-variant="primary"
                type="submit"
                disabled={busy}
              >
                Salvar ficha
              </button>
              <button
                className="console-button"
                type="button"
                onClick={() => setSheetOpen(false)}
              >
                Fechar
              </button>
            </div>
          </form>
        ) : null}
      </td>
      <td>
        <div className="console-actions">
          <button
            className="console-button"
            type="button"
            onClick={() => setSheetOpen((open) => !open)}
          >
            {sheetOpen ? "Ocultar ficha" : "Editar ficha"}
          </button>
          <button
            className="console-button"
            type="button"
            onClick={() => setPublicationOpen((open) => !open)}
          >
            {publicationOpen ? "Ocultar publicação" : "Publicação"}
          </button>
        </div>
        {publicationOpen ? (
          <form
            className="console-form"
            onSubmit={(event) => {
              event.preventDefault();
              void onRun({
                acao: "catalogo-publicacao",
                id: item.id,
                published,
                publishedFrom: toIso(from),
                publishedUntil: toIso(until),
                expectedUpdatedAt: item.updated_at,
                confirmSku,
              });
            }}
          >
            <label className="console-check">
              <input
                type="checkbox"
                checked={published}
                onChange={(event) => setPublished(event.target.checked)}
              />
              Publicada na vitrine
            </label>
            <div className="console-form-grid">
              <label className="console-field">
                No ar a partir de
                <input
                  type="datetime-local"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                />
              </label>
              <label className="console-field">
                No ar até
                <input
                  type="datetime-local"
                  value={until}
                  onChange={(event) => setUntil(event.target.value)}
                />
              </label>
            </div>
            <label className="console-field">
              Confirme o SKU ({item.sku})
              <input
                value={confirmSku}
                onChange={(event) => setConfirmSku(event.target.value)}
                autoComplete="off"
              />
            </label>
            <div className="console-actions">
              <button
                className="console-button"
                data-variant="primary"
                type="submit"
                disabled={busy || confirmSku.trim() !== item.sku}
              >
                Aplicar publicação
              </button>
            </div>
          </form>
        ) : null}
      </td>
    </tr>
  );
}

function BriefingsPanel({
  items,
  status,
  busy,
  onRun,
}: {
  items: ConsoleBriefing[] | null;
  status: ConsoleStatus | null;
  busy: boolean;
  onRun: (action: ConsoleActionBody) => Promise<void>;
}) {
  return (
    <>
      {status && !status.entrega.habilitada ? (
        <p className="console-note">
          Envio ao comercial desligado: {status.entrega.motivo}. Nenhum lead
          novo entra no banco enquanto isso.
        </p>
      ) : null}
      {!items ? (
        <p className="console-muted">Consultando os leads…</p>
      ) : !items.length ? (
        <p className="console-note" data-tone="ok">
          Nenhum lead registrado. O formulário público só grava quando o envio
          ao comercial está configurado.
        </p>
      ) : (
        <div className="console-table-wrap">
          <table className="console-table">
            <thead>
              <tr>
                <th scope="col">Protocolo</th>
                <th scope="col">Contato</th>
                <th scope="col">Ocasião</th>
                <th scope="col">Entrega</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((briefing) => (
                <BriefingRow
                  key={`${briefing.id}-${briefing.status}-${briefing.delivery_status}-${briefing.delivery_lease_expires_at ?? ""}`}
                  briefing={briefing}
                  busy={busy}
                  onRun={onRun}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function BriefingRow({
  briefing,
  busy,
  onRun,
}: {
  briefing: ConsoleBriefing;
  busy: boolean;
  onRun: (action: ConsoleActionBody) => Promise<void>;
}) {
  const lease = briefing.delivery_lease_expires_at;
  const inFlight =
    briefing.delivery_status === "delivering" &&
    typeof lease === "string" &&
    Date.parse(lease) > Date.now();
  const requeueable =
    briefing.delivery_status === "failed" ||
    (briefing.delivery_status === "delivering" && !inFlight);
  const [pendente, setPendente] = useState<ConsoleBriefingStatus>(
    briefing.status as ConsoleBriefingStatus,
  );
  return (
    <tr>
      <td>
        <strong>{briefing.protocol}</strong>
        <p className="console-muted">{formatDate(briefing.created_at)}</p>
        <p className="console-muted">
          {statusLabels[briefing.status] ?? briefing.status}
        </p>
      </td>
      <td>
        {briefing.contact_name}
        <p className="console-muted">{briefing.company}</p>
        <p className="console-muted">{briefing.email}</p>
      </td>
      <td>
        {briefing.occasion}
        <p className="console-muted">
          {briefing.desired_date
            ? `desejada para ${formatDay(briefing.desired_date)}`
            : "sem data desejada"}{" "}
          · {briefingPieces(briefing.items)}
        </p>
        <details className="console-details">
          <summary>Detalhes do pedido</summary>
          <pre>{briefingItemsText(briefing.items)}</pre>
          <pre>{briefing.message ?? "Sem mensagem."}</pre>
          <pre>{briefing.budget ? `Orçamento: ${briefing.budget}` : "Orçamento não informado."}</pre>
        </details>
      </td>
      <td>
        <span
          className="console-badge"
          data-state={briefing.delivery_status === "delivered" ? "live" : briefing.delivery_status === "failed" ? "fail" : "out"}
        >
          {deliveryLabels[briefing.delivery_status] ?? briefing.delivery_status}
        </span>
        <p className="console-muted">
          {briefing.delivery_attempts} tentativa(s)
        </p>
        {briefing.delivered_at ? (
          <p className="console-muted">
            entregue em {formatDate(briefing.delivered_at)}
          </p>
        ) : null}
        {briefing.last_delivery_error ? (
          <p className="console-muted">Erro: {briefing.last_delivery_error}</p>
        ) : null}
      </td>
      <td>
        <label className="console-field">
          <span>Situação do lead</span>
          <select
            value={pendente}
            disabled={busy}
            aria-label={`Situação do lead ${briefing.protocol}`}
            onChange={(event) =>
              setPendente(event.target.value as ConsoleBriefingStatus)
            }
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          className="console-button"
          type="button"
          disabled={busy || pendente === briefing.status}
          aria-label={`Gravar situação do lead ${briefing.protocol}`}
          onClick={() =>
            void onRun({
              acao: "briefing-status",
              id: briefing.id,
              status: pendente,
            })
          }
        >
          Gravar situação
        </button>
        {requeueable ? (
          <button
            className="console-button"
            type="button"
            disabled={busy}
            onClick={() =>
              void onRun({ acao: "briefing-reenviar", id: briefing.id })
            }
          >
            Voltar para a fila
          </button>
        ) : null}
      </td>
    </tr>
  );
}

function LimitsPanel({
  items,
  busy,
  onRun,
}: {
  items: ConsoleLimit[] | null;
  busy: boolean;
  onRun: (action: ConsoleActionBody) => Promise<void>;
}) {
  return (
    <>
      <p className="console-note" data-tone="ok">
        A limpeza automática roda a cada 5 minutos no banco e remove apenas
        registros sem atividade há mais de uma hora; ela não libera ninguém na
        hora. Quem recebeu o bloqueio vê um código de atendimento de 8 dígitos na
        mensagem de erro: a coluna Código mostra o mesmo valor, e só a linha
        bloqueada — 5 tentativas nos últimos 10 minutos — pode ser liberada.
      </p>
      <div className="console-actions" style={{ marginBottom: 16 }}>
        <button
          className="console-button"
          type="button"
          disabled={busy}
          onClick={() => void onRun({ acao: "limites-limpar" })}
        >
          Limpar limites agora
        </button>
      </div>
      {!items ? (
        <p className="console-muted">Consultando os limites…</p>
      ) : !items.length ? (
        <p className="console-muted">Nenhum limite registrado.</p>
      ) : (
        <div className="console-table-wrap">
          <table className="console-table">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Tentativas na janela</th>
                <th scope="col">Situação</th>
                <th scope="col">Última tentativa</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((limit) => (
                <tr key={`${limit.client_hash}-${limit.updated_at}`}>
                  <td>
                    <code>{limit.reference}</code>
                  </td>
                  <td>
                    {limit.recent_attempts} de {RATE_LIMIT_MAX_ATTEMPTS}
                  </td>
                  <td className="console-muted">
                    {limit.blocked ? "Bloqueado" : "Sem bloqueio"}
                  </td>
                  <td className="console-muted">
                    {formatDate(limit.last_attempt_at)}
                  </td>
                  <td>
                    <button
                      className="console-button"
                      type="button"
                      disabled={busy || !limit.blocked}
                      aria-label={`Liberar contato ${limit.reference}`}
                      onClick={() =>
                        void onRun({
                          acao: "limites-liberar",
                          clientHash: limit.client_hash,
                        })
                      }
                    >
                      Liberar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}