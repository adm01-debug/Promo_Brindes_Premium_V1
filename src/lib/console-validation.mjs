export const BRIEFING_STATUSES = ["received", "qualified", "closed"];

/** Mirrors the premium_briefings.status CHECK constraint. */
export function isBriefingStatus(value) {
  return typeof value === "string" && BRIEFING_STATUSES.includes(value);
}

/** RFC 3339 com fuso, como o PostgREST devolve timestamptz (até 6 casas). */
export function isRfc3339(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  );
}

/** Identificação do contato nos limites: HMAC-SHA256 em hexadecimal. */
export function isClientHash(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}

/** Janela e teto do limitador, iguais aos de allow_premium_briefing_attempt. */
export const RATE_LIMIT_WINDOW_MS = 10 * 60_000;
export const RATE_LIMIT_MAX_ATTEMPTS = 5;

/**
 * Referência de atendimento: os primeiros dígitos do hash. Quem foi bloqueado
 * recebe o mesmo código na mensagem de erro, então o operador identifica a
 * linha certa sem ver endereço nenhum.
 */
export function rateLimitReference(clientHash) {
  return isClientHash(clientHash) ? clientHash.slice(0, 8) : null;
}

/**
 * Resume uma linha de premium_briefing_rate_limits. O bloqueio só existe com
 * RATE_LIMIT_MAX_ATTEMPTS tentativas dentro da janela: linhas antigas continuam
 * gravadas e não podem ser liberadas como se estivessem bloqueadas.
 */
export function summarizeRateLimit(attemptTimes, now = Date.now()) {
  const instants = (Array.isArray(attemptTimes) ? attemptTimes : [])
    .map((value) => (typeof value === "string" ? Date.parse(value) : NaN))
    .filter((value) => Number.isFinite(value));
  const recent = instants.filter((value) => value > now - RATE_LIMIT_WINDOW_MS);
  return {
    attempts: instants.length,
    recentAttempts: recent.length,
    blocked: recent.length >= RATE_LIMIT_MAX_ATTEMPTS,
    lastAttemptAt: instants.length
      ? new Date(Math.max(...instants)).toISOString()
      : null,
  };
}

/**
 * A vitrine é replicada uma vez por dia. Passado esse tempo sem sucesso
 * registrado, o console avisa que a base premium ficou para trás.
 */
export const REPLICATION_STALE_MS = 48 * 60 * 60 * 1000;

/**
 * Resume a linha única de premium_catalog_sync_state. Sem tentativa registrada a
 * resposta é `registrada: false`, e o console diz que ainda não houve replicação
 * em vez de fingir um estado saudável.
 */
export function summarizeReplication(row, now = Date.now()) {
  const attempt =
    typeof row?.last_attempt_at === "string"
      ? Date.parse(row.last_attempt_at)
      : NaN;
  const success =
    typeof row?.last_success_at === "string"
      ? Date.parse(row.last_success_at)
      : NaN;
  const hasAttempt = Number.isFinite(attempt);
  const hasSuccess = Number.isFinite(success);
  return {
    registrada: hasAttempt,
    status: /** @type {"success" | "failed" | null} */ (
      row?.last_status === "success"
        ? "success"
        : row?.last_status === "failed"
          ? "failed"
          : null
    ),
    ultimaTentativaEm: hasAttempt ? new Date(attempt).toISOString() : null,
    ultimoSucessoEm: hasSuccess ? new Date(success).toISOString() : null,
    horasDesdeSucesso: hasSuccess
      ? Math.floor((now - success) / 3_600_000)
      : null,
    atrasada: hasSuccess ? now - success > REPLICATION_STALE_MS : hasAttempt,
    erro:
      typeof row?.last_error === "string" && row.last_error.length
        ? row.last_error
        : null,
    origem: Number.isInteger(row?.source_count) ? row.source_count : null,
    curados: Number.isInteger(row?.curated_count) ? row.curated_count : null,
  };
}

/**
 * Rules shared by the operations console and its tests. Every limit here
 * mirrors a constraint of premium_catalog_items in the premium database, so the
 * console refuses invalid technical sheets before the database does.
 */
export const TECHNICAL_SHEET_LIMITS = {
  materials: 5,
  materialLength: 40,
  dimensionsMin: 2,
  dimensionsMax: 80,
  packagingMin: 2,
  packagingMax: 120,
  weightMin: 1,
  weightMax: 100000,
};

/** Splits a textarea value into the list of materials of a technical sheet. */
export function parseMaterialLines(raw) {
  return String(raw ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function optionalText(raw, minimum, maximum, label, errors) {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim();
  if (!value.length) return null;
  if (value.length < minimum || value.length > maximum) {
    errors.push(`${label} precisa ter de ${minimum} a ${maximum} caracteres.`);
    return null;
  }
  return value;
}

function optionalWeight(raw, errors) {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim();
  if (!value.length) return null;
  if (!/^\d{1,6}$/.test(value)) {
    errors.push("O peso precisa ser um número inteiro de gramas.");
    return null;
  }
  const grams = Number(value);
  if (grams < TECHNICAL_SHEET_LIMITS.weightMin || grams > TECHNICAL_SHEET_LIMITS.weightMax) {
    errors.push(
      `O peso precisa ficar entre ${TECHNICAL_SHEET_LIMITS.weightMin} e ${TECHNICAL_SHEET_LIMITS.weightMax} gramas.`,
    );
    return null;
  }
  return grams;
}

/**
 * Validates and normalizes the four technical sheet fields. Value is only
 * returned when every field is valid, ready to be written by the console.
 */
export function validateTechnicalSheet(input) {
  const errors = [];
  const rawMaterials = Array.isArray(input?.materials)
    ? input.materials
    : parseMaterialLines(input?.materials);
  const materials = rawMaterials.map((entry) => String(entry ?? "").trim());
  if (materials.length > TECHNICAL_SHEET_LIMITS.materials) {
    errors.push(`A ficha aceita no máximo ${TECHNICAL_SHEET_LIMITS.materials} materiais.`);
  } else if (materials.some((entry) => !entry.length)) {
    errors.push("Cada material precisa de um nome.");
  } else if (materials.some((entry) => entry.length > TECHNICAL_SHEET_LIMITS.materialLength)) {
    errors.push(
      `Cada material aceita até ${TECHNICAL_SHEET_LIMITS.materialLength} caracteres.`,
    );
  }
  const dimensions = optionalText(
    input?.dimensions,
    TECHNICAL_SHEET_LIMITS.dimensionsMin,
    TECHNICAL_SHEET_LIMITS.dimensionsMax,
    "As medidas",
    errors,
  );
  const packaging = optionalText(
    input?.packaging,
    TECHNICAL_SHEET_LIMITS.packagingMin,
    TECHNICAL_SHEET_LIMITS.packagingMax,
    "A embalagem",
    errors,
  );
  const weightG = optionalWeight(input?.weightG ?? input?.weight_g, errors);
  if (errors.length) return { valid: false, errors, value: null };
  return {
    valid: true,
    errors: [],
    value: { materials, dimensions, weight_g: weightG, packaging },
  };
}