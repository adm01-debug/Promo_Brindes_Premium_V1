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
  isBriefingStatus,
  isClientHash,
  isRfc3339,
  parseMaterialLines,
  rateLimitReference,
  summarizeRateLimit,
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