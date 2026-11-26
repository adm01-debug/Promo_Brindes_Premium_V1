import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSOLE_SESSION_TTL_MS,
  consoleAccessConfig,
  issueConsoleSession,
  matchesConsoleToken,
  requestComesFromSelf,
  verifyConsoleSession,
} from "../../src/lib/console-access.mjs";
import {
  RATE_LIMIT_MAX_ATTEMPTS,
  RATE_LIMIT_WINDOW_MS,
  REPLICATION_STALE_MS,
  MAINTENANCE_STALE_MS,
  isBriefingStatus,
  isClientHash,
  isRfc3339,
  manualPruneFailureMessage,
  parseMaterialLines,
  pruneCountFromResponse,
  rateLimitReference,
  summarizeMaintenance,
  summarizeManualPrune,
  summarizeRateLimit,
  summarizeReplication,
  validateTechnicalSheet,
} from "../../src/lib/console-validation.mjs";

const token = "a".repeat(40);
const enabled = {
  PROMO_PREMIUM_CONSOLE_ENABLED: "true",
  PROMO_PREMIUM_CONSOLE_TOKEN: token,
};

test("the console stays hidden without an explicit enable flag", () => {
  assert.equal(consoleAccessConfig({}), null);
  assert.equal(
    consoleAccessConfig({ ...enabled, PROMO_PREMIUM_CONSOLE_ENABLED: "false" }),
    null,
  );
});

test("the console refuses weak or padded tokens", () => {
  assert.equal(consoleAccessConfig({ ...enabled, PROMO_PREMIUM_CONSOLE_TOKEN: "" }), null);
  assert.equal(
    consoleAccessConfig({ ...enabled, PROMO_PREMIUM_CONSOLE_TOKEN: "a".repeat(31) }),
    null,
  );
  assert.equal(
    consoleAccessConfig({ ...enabled, PROMO_PREMIUM_CONSOLE_TOKEN: `${token} ` }),
    null,
  );
  assert.deepEqual(consoleAccessConfig(enabled), {
    token,
    ttlMs: CONSOLE_SESSION_TTL_MS,
  });
});

test("a session issued for a configuration is accepted only by it", () => {
  const config = consoleAccessConfig(enabled);
  const session = issueConsoleSession(config, 1_000);
  assert.equal(verifyConsoleSession(config, session, 2_000), true);
  assert.equal(
    verifyConsoleSession(
      consoleAccessConfig({ ...enabled, PROMO_PREMIUM_CONSOLE_TOKEN: "b".repeat(40) }),
      session,
      2_000,
    ),
    false,
  );
});

test("expired, tampered and malformed sessions are rejected", () => {
  const config = consoleAccessConfig(enabled);
  const session = issueConsoleSession(config, 1_000);
  assert.equal(
    verifyConsoleSession(config, session, 1_000 + CONSOLE_SESSION_TTL_MS + 1),
    false,
  );
  const parts = session.split(".");
  const forgedValue = `${parts[0]}.${Number(parts[1]) + 60_000}.${parts[2]}.${parts[3]}`;
  assert.equal(verifyConsoleSession(config, forgedValue, 2_000), false);
  assert.equal(verifyConsoleSession(config, `${parts.slice(0, 3).join(".")}.`, 2_000), false);
  for (const value of [null, undefined, "", "v1", "v2.1.a.b", 42, {}])
    assert.equal(verifyConsoleSession(config, value, 2_000), false);
  assert.equal(verifyConsoleSession(null, session, 2_000), false);
});

test("the login form only accepts the configured token", () => {
  const config = consoleAccessConfig(enabled);
  assert.equal(matchesConsoleToken(config, token), true);
  assert.equal(matchesConsoleToken(config, `${token}b`), false);
  assert.equal(matchesConsoleToken(config, "a".repeat(39)), false);
  assert.equal(matchesConsoleToken(config, undefined), false);
  assert.equal(matchesConsoleToken(null, token), false);
});

test("material lines drop blanks and keep the typed order", () => {
  assert.deepEqual(parseMaterialLines(" Aço inox \n\n  Couro  \n"), [
    "Aço inox",
    "Couro",
  ]);
  assert.deepEqual(parseMaterialLines(null), []);
});

test("a complete technical sheet is trimmed and accepted", () => {
  const result = validateTechnicalSheet({
    materials: " Aço inox \n Couro \n",
    dimensions: " 20 x 10 x 5 cm ",
    weightG: " 290 ",
    packaging: " Caixa de papelão ",
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.value, {
    materials: ["Aço inox", "Couro"],
    dimensions: "20 x 10 x 5 cm",
    weight_g: 290,
    packaging: "Caixa de papelão",
  });
});

test("an empty technical sheet clears every optional field", () => {
  const result = validateTechnicalSheet({
    materials: [],
    dimensions: "",
    weightG: "",
    packaging: "   ",
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.value, {
    materials: [],
    dimensions: null,
    weight_g: null,
    packaging: null,
  });
});

test("the technical sheet rules mirror the premium database constraints", () => {
  const tooMany = validateTechnicalSheet({
    materials: ["a", "b", "c", "d", "e", "f"],
  });
  assert.equal(tooMany.valid, false);
  assert.equal(tooMany.value, null);

  const blankMaterial = validateTechnicalSheet({ materials: ["Aço", ""] });
  assert.equal(blankMaterial.valid, false);

  const shortDimensions = validateTechnicalSheet({ dimensions: "1" });
  assert.equal(shortDimensions.valid, false);

  const longPackaging = validateTechnicalSheet({ packaging: "x".repeat(121) });
  assert.equal(longPackaging.valid, false);

  for (const weight of ["0", "100001", "2.5", "abc", "-3"]) {
    const invalid = validateTechnicalSheet({ weightG: weight });
    assert.equal(invalid.valid, false, `weight ${weight} should be refused`);
  }

  const longMaterial = validateTechnicalSheet({
    materials: ["x".repeat(41)],
  });
  assert.equal(longMaterial.valid, false);
});
test("only the site itself may post to the console", () => {
  const request = (headers) =>
    new Request("http://localhost:3107/api/operacoes/sessao", {
      method: "POST",
      headers,
    });

  assert.equal(
    requestComesFromSelf(
      request({ origin: "http://localhost:3107", host: "localhost:3107" }),
    ),
    true,
    "the browser page posting to its own origin must pass",
  );
  assert.equal(
    requestComesFromSelf(
      request({
        origin: "https://premium.example.com",
        host: "premium.example.com",
        "x-forwarded-proto": "https",
      }),
    ),
    true,
    "behind a proxy the forwarded host and protocol must be used",
  );
  assert.equal(
    requestComesFromSelf(
      request({ origin: "https://evil.example.com", host: "premium.example.com" }),
    ),
    false,
  );
  assert.equal(
    requestComesFromSelf(request({ host: "premium.example.com" })),
    false,
    "a request without Origin is refused",
  );
});

test("the console only accepts the three lead statuses of the database", () => {
  for (const value of ["received", "qualified", "closed"])
    assert.equal(isBriefingStatus(value), true, `${value} must be accepted`);
  for (const value of ["Received", "open", "", null, undefined, 7, ["closed"]])
    assert.equal(isBriefingStatus(value), false, `${String(value)} must be refused`);
});

test("the console only accepts the contact hash of the rate limiter", () => {
  assert.equal(isClientHash("a".repeat(64)), true);
  assert.equal(isClientHash("0123456789abcdef".repeat(4)), true);
  for (const value of [
    "a".repeat(63),
    "a".repeat(65),
    "A".repeat(64),
    "g".repeat(64),
    "",
    null,
    undefined,
    64,
  ])
    assert.equal(isClientHash(value), false, `${String(value)} must be refused`);
});

test("the support code is the visible part of the same contact hash", () => {
  const hash = "0123456789abcdef".repeat(4);
  const reference = rateLimitReference(hash);
  assert.equal(reference, "01234567");
  assert.equal(hash.startsWith(String(reference)), true);
  for (const value of ["", "a".repeat(63), "A".repeat(64), null, undefined])
    assert.equal(rateLimitReference(value), null);
});

test("only five attempts inside the window count as a block", () => {
  const now = Date.parse("2026-11-26T12:00:00Z");
  const minute = 60_000;
  const attempt = (offsetMinutes) =>
    new Date(now - offsetMinutes * minute).toISOString();

  const blocked = summarizeRateLimit(
    [0, 1, 2, 3, 4].map((offset) => attempt(offset)),
    now,
  );
  assert.deepEqual(blocked, {
    attempts: 5,
    recentAttempts: 5,
    blocked: true,
    lastAttemptAt: "2026-11-26T12:00:00.000Z",
  });

  // Quatro tentativas recentes: o visitante ainda pode enviar e a linha não
  // pode ser liberada como se estivesse bloqueada.
  const free = summarizeRateLimit([0, 1, 2, 3].map((o) => attempt(o)), now);
  assert.equal(free.recentAttempts, 4);
  assert.equal(free.blocked, false);

  // Cinco registros gravados, mas o mais antigo saiu da janela de 10 minutos.
  const expired = summarizeRateLimit(
    [0, 1, 2, 3, 11].map((offset) => attempt(offset)),
    now,
  );
  assert.equal(expired.attempts, 5);
  assert.equal(expired.recentAttempts, 4);
  assert.equal(expired.blocked, false);

  assert.equal(RATE_LIMIT_MAX_ATTEMPTS, 5);
  assert.equal(RATE_LIMIT_WINDOW_MS, 600_000);
});

test("invalid or empty attempt histories never look like a block", () => {
  const now = Date.parse("2026-11-26T12:00:00Z");
  for (const value of [null, undefined, "2026-11-26T12:00:00Z", [], [null, 7, {}]]) {
    const summary = summarizeRateLimit(value, now);
    assert.equal(summary.blocked, false, `${String(value)} must not block`);
    assert.equal(summary.lastAttemptAt, null);
  }
  const far = summarizeRateLimit(
    Array.from({ length: 5 }, () => "2026-11-26T11:00:01Z"),
    now,
  );
  assert.equal(far.blocked, false);
  assert.equal(far.attempts, 5);
});

test("the console only accepts the timestamps the database returns", () => {
  for (const value of [
    "2026-11-26T10:01:34.413148+00:00",
    "2026-11-26T10:01:34.413Z",
    "2026-11-26T10:01:34Z",
  ])
    assert.equal(isRfc3339(value), true, `${value} must be accepted`);
  for (const value of [
    "2026-11-26",
    "2026-11-26 10:01:34Z",
    "2026-11-26T10:01:34",
    "2026-11-26T10:01:34.1234567Z",
    "",
    null,
    undefined,
    42,
  ])
    assert.equal(isRfc3339(value), false, `${String(value)} must be refused`);
});
const replicationNow = Date.parse("2026-11-26T18:00:00.000Z");
const replicationRow = (overrides = {}) => ({
  last_attempt_at: "2026-11-26T14:00:00.000Z",
  last_status: "success",
  last_success_at: "2026-11-26T14:00:00.000Z",
  last_error: null,
  source_count: 7968,
  curated_count: 8,
  ...overrides,
});

test("a fresh replication shows when it ran and what it checked", () => {
  assert.deepEqual(summarizeReplication(replicationRow(), replicationNow), {
    registrada: true,
    status: "success",
    ultimaTentativaEm: "2026-11-26T14:00:00.000Z",
    ultimoSucessoEm: "2026-11-26T14:00:00.000Z",
    horasDesdeSucesso: 4,
    atrasada: false,
    erro: null,
    origem: 7968,
    curados: 8,
  });
});

test("a stalled replication is flagged after the stale window", () => {
  const success = Date.parse("2026-11-26T14:00:00.000Z");
  const inside = summarizeReplication(
    replicationRow(),
    success + REPLICATION_STALE_MS,
  );
  assert.equal(inside.atrasada, false);
  const late = summarizeReplication(
    replicationRow(),
    success + REPLICATION_STALE_MS + 1,
  );
  assert.equal(late.atrasada, true);
  assert.equal(late.erro, null);
});

test("a failed attempt keeps the last success and exposes the reason", () => {
  const failed = summarizeReplication(
    replicationRow({
      last_attempt_at: "2026-11-26T17:00:00.000Z",
      last_status: "failed",
      last_error: "Catalog sync failed (HTTP 503).",
    }),
    replicationNow,
  );
  assert.equal(failed.status, "failed");
  assert.equal(failed.atrasada, false);
  assert.equal(failed.ultimoSucessoEm, "2026-11-26T14:00:00.000Z");
  assert.equal(failed.horasDesdeSucesso, 4);
  assert.equal(failed.erro, "Catalog sync failed (HTTP 503).");
});

test("a failed attempt without any success is already late", () => {
  const failed = summarizeReplication(
    replicationRow({
      last_status: "failed",
      last_success_at: null,
      last_error: "Approved site API configuration is missing or mismatched.",
    }),
    replicationNow,
  );
  assert.equal(failed.status, "failed");
  assert.equal(failed.ultimoSucessoEm, null);
  assert.equal(failed.horasDesdeSucesso, null);
  assert.equal(failed.atrasada, true);
});

test("an empty or malformed heartbeat never looks healthy", () => {
  const nothing = summarizeReplication(null, replicationNow);
  assert.equal(nothing.registrada, false);
  assert.equal(nothing.status, null);
  assert.equal(nothing.erro, null);
  // Sem tentativa nenhuma o console diz "sem registro" na aba Situação, então
  // aqui não há atraso a declarar: a própria tela já avisa.
  assert.equal(nothing.atrasada, false);
  for (const row of [undefined, {}, { last_attempt_at: "not a date" }]) {
    const summary = summarizeReplication(row, replicationNow);
    assert.equal(summary.registrada, false);
    assert.equal(summary.atrasada, false);
    assert.equal(summary.ultimaTentativaEm, null);
    assert.equal(summary.origem, null);
  }

  // Tentativa registrada com sucesso e sem data de sucesso é estado inconsistente:
  // atrasada, e o motivo do erro continua disponível quando existir.
  const inconsistent = summarizeReplication(
    {
      last_attempt_at: "2026-11-26T14:00:00.000Z",
      last_status: "failed",
      last_success_at: null,
      last_error: "Falha sem mensagem.",
      source_count: "7968",
      curated_count: 8.5,
    },
    replicationNow,
  );
  assert.equal(inconsistent.registrada, true);
  assert.equal(inconsistent.atrasada, true);
  assert.equal(inconsistent.origem, null);
  assert.equal(inconsistent.curados, null);
  assert.equal(inconsistent.erro, "Falha sem mensagem.");
});
const maintenanceNow = Date.parse("2026-11-26T18:00:00.000Z");
const maintenanceRow = (overrides = {}) => ({
  last_status: "success",
  last_finished_at: "2026-11-26T17:55:00.000Z",
  last_success_at: "2026-11-26T17:55:00.000Z",
  last_removed: 3,
  last_error: null,
  run_count: 4242,
  ...overrides,
});

test("a fresh maintenance run proves the scheduler is alive", () => {
  assert.deepEqual(summarizeMaintenance(maintenanceRow(), maintenanceNow), {
    registrada: true,
    status: "success",
    ultimaExecucaoEm: "2026-11-26T17:55:00.000Z",
    ultimoSucessoEm: "2026-11-26T17:55:00.000Z",
    minutosDesdeExecucao: 5,
    atrasada: false,
    removidos: 3,
    execucoes: 4242,
    erro: null,
  });
});

test("a maintenance run older than three cycles is flagged", () => {
  const finished = Date.parse("2026-11-26T17:55:00.000Z");
  const inside = summarizeMaintenance(
    maintenanceRow(),
    finished + MAINTENANCE_STALE_MS,
  );
  assert.equal(inside.atrasada, false);
  const late = summarizeMaintenance(
    maintenanceRow(),
    finished + MAINTENANCE_STALE_MS + 1,
  );
  assert.equal(late.atrasada, true);
  assert.equal(late.minutosDesdeExecucao, 15);
  assert.equal(late.erro, null);
});

test("a failed maintenance run keeps the last success and the reason", () => {
  const failed = summarizeMaintenance(
    maintenanceRow({
      last_status: "failed",
      last_finished_at: "2026-11-26T17:56:00.000Z",
      last_removed: null,
      last_error: "synthetic retention failure",
    }),
    maintenanceNow,
  );
  assert.equal(failed.status, "failed");
  assert.equal(failed.removidos, null);
  assert.equal(failed.ultimoSucessoEm, "2026-11-26T17:55:00.000Z");
  assert.equal(failed.erro, "synthetic retention failure");
});

test("a missing or malformed maintenance heartbeat never looks healthy", () => {
  const nothing = summarizeMaintenance(null, maintenanceNow);
  assert.equal(nothing.registrada, false);
  assert.equal(nothing.status, null);
  assert.equal(nothing.removidos, null);
  assert.equal(nothing.execucoes, null);
  // Sem execução nenhuma não há atraso a declarar: a própria tela diz que não
  // há registro, em vez de inventar um relógio.
  assert.equal(nothing.atrasada, false);
  for (const row of [undefined, {}, { last_finished_at: "not a date" }]) {
    const summary = summarizeMaintenance(row, maintenanceNow);
    assert.equal(summary.registrada, false);
    assert.equal(summary.atrasada, false);
    assert.equal(summary.ultimaExecucaoEm, null);
    assert.equal(summary.removidos, null);
  }
  const inconsistent = summarizeMaintenance(
    {
      last_status: "success",
      last_finished_at: "2026-11-26T17:00:00.000Z",
      last_success_at: null,
      last_removed: "3",
      run_count: 2.5,
      last_error: "",
    },
    maintenanceNow,
  );
  assert.equal(inconsistent.registrada, true);
  assert.equal(inconsistent.atrasada, true);
  assert.equal(inconsistent.removidos, null);
  assert.equal(inconsistent.execucoes, null);
  assert.equal(inconsistent.erro, null);
});
test("a manual prune never hides a stopped scheduler", () => {
  // A linha do agendador está atrasada (duas horas) e a limpeza manual rodou
  // agora: o estado do card continua vindo do agendador.
  const manual = summarizeManualPrune({
    last_status: "success",
    last_finished_at: "2026-11-26T18:00:00.000Z",
    last_success_at: "2026-11-26T18:00:00.000Z",
    last_removed: 0,
    last_error: null,
    run_count: 1,
  });
  assert.equal(manual.registrada, true);
  assert.equal(manual.falhou, false);
  assert.equal(manual.ultimaExecucaoEm, "2026-11-26T18:00:00.000Z");
  assert.equal(manual.removidos, 0);
  assert.equal(manual.erro, null);
  // Sem execução manual registrada, nada de estado inventado.
  for (const row of [undefined, null, {}, { last_finished_at: "nope" }]) {
    const empty = summarizeManualPrune(row);
    assert.equal(empty.registrada, false);
    assert.equal(empty.falhou, false);
    assert.equal(empty.ultimaExecucaoEm, null);
    assert.equal(empty.removidos, null);
  }
});

test("a failed manual prune keeps its reason and no count", () => {
  const failed = summarizeManualPrune({
    last_status: "failed",
    last_finished_at: "2026-11-26T18:05:00.000Z",
    last_success_at: null,
    last_removed: null,
    last_error: "synthetic manual retention failure",
    run_count: 2,
  });
  assert.equal(failed.registrada, true);
  assert.equal(failed.falhou, true);
  assert.equal(failed.removidos, null);
  assert.equal(failed.erro, "synthetic manual retention failure");
});
test("a manual prune only succeeds with a real count from the database", () => {
  // null é o que a função devolve quando a remoção falha: não pode virar
  // "limpeza executada" na tela.
  assert.equal(pruneCountFromResponse(null), null);
  assert.equal(pruneCountFromResponse(undefined), null);
  for (const value of ["3", -1, 1.5, NaN, Infinity, true, {}, []]) {
    assert.equal(pruneCountFromResponse(value), null);
  }
  assert.equal(pruneCountFromResponse(0), 0);
  assert.equal(pruneCountFromResponse(42), 42);
});

test("a failed manual prune brings its reason to the operator", () => {
  // O motivo já está gravado na linha da limpeza manual: a resposta do console
  // usa esse texto em vez de mandar o operador para outra aba.
  assert.equal(
    manualPruneFailureMessage({
      falhou: true,
      erro: "synthetic manual retention failure",
    }),
    "A limpeza não foi concluída; nada foi removido: synthetic manual retention failure.",
  );
  // Sem motivo legível (ou sem histórico), a mensagem continua correta e diz
  // onde a explicação fica.
  for (const manual of [
    null,
    undefined,
    { falhou: false, erro: null },
    { falhou: true, erro: null },
  ]) {
    const mensagem = manualPruneFailureMessage(manual);
    assert.ok(mensagem.includes("nada foi removido"));
    assert.ok(mensagem.includes("Situação"));
    assert.ok(!mensagem.includes("null"));
  }
});