export const BRIEFING_STATUSES = ["received", "qualified", "closed"];

/** Mirrors the premium_briefings.status CHECK constraint. */
export function isBriefingStatus(value) {
  return typeof value === "string" && BRIEFING_STATUSES.includes(value);
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