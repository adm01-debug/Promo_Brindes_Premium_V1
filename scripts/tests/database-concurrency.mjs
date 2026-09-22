import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const databaseUrl = `postgresql://${["postgres", "postgres"].join(":")}@127.0.0.1:54322/postgres`;
const briefingKey = "concurrency-test-0001";
const rateHash = "f".repeat(64);

const psqlArgs = [
  databaseUrl,
  "--no-psqlrc",
  "--tuples-only",
  "--no-align",
  "--field-separator=|",
  "--set=ON_ERROR_STOP=1",
];

function querySync(sql) {
  return execFileSync("psql", [...psqlArgs, "--command", sql], {
    encoding: "utf8",
  }).trim();
}

async function query(sql) {
  const { stdout } = await execFileAsync(
    "psql",
    [...psqlArgs, "--command", sql],
    { encoding: "utf8" },
  );
  return stdout.trim();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function leaseToken(row) {
  const token = row.split("|")[1];
  assert(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      token,
    ),
    "claim did not return a valid lease token",
  );
  return token;
}

function cleanup() {
  querySync(`
    delete from public.premium_briefing_rate_limits
    where client_hash = '${rateHash}';
    delete from public.premium_briefings
    where idempotency_key = '${briefingKey}';
  `);
}

try {
  cleanup();
  querySync(`
    select * from public.persist_premium_briefing(
      '${briefingKey}', repeat('e', 64), 'Synthetic Person',
      'Synthetic Company', 'concurrency@example.invalid',
      'Concurrency audit', null, null, null, '[]'::jsonb
    );
  `);

  const firstClaim = querySync(`
    select claimed, delivery_lease_token
    from public.claim_premium_briefing_delivery_v2('${briefingKey}');
  `);
  assert(firstClaim.startsWith("t|"), "first worker did not claim delivery");
  const staleToken = leaseToken(firstClaim);

  querySync(`
    update public.premium_briefings
    set delivery_lease_expires_at = clock_timestamp() - interval '1 second'
    where idempotency_key = '${briefingKey}';
  `);

  const claims = await Promise.all(
    Array.from({ length: 8 }, () =>
      query(`
        select claimed, coalesce(delivery_lease_token::text, '')
        from public.claim_premium_briefing_delivery_v2('${briefingKey}');
      `),
    ),
  );
  const winners = claims.filter((row) => row.startsWith("t|"));
  const rejected = claims.filter((row) => row === "f|");
  assert(
    winners.length === 1,
    `expected one claim winner, got ${winners.length}`,
  );
  assert(
    rejected.length === 7,
    `expected seven rejected claims, got ${rejected.length}`,
  );
  const currentToken = leaseToken(winners[0]);

  const staleRows = querySync(`
    select count(*) from public.record_premium_briefing_delivery_v2(
      '${briefingKey}', '${staleToken}'::uuid, false, 'stale_failure'
    );
  `);
  assert(staleRows === "0", "stale lease modified the current attempt");

  const currentRows = querySync(`
    select count(*) from public.record_premium_briefing_delivery_v2(
      '${briefingKey}', '${currentToken}'::uuid, true, null
    );
  `);
  assert(currentRows === "1", "current lease did not finalize delivery");

  const finalState = querySync(`
    select delivery_status, delivery_attempts,
      delivery_lease_token is null, delivery_lease_expires_at is null
    from public.premium_briefings
    where idempotency_key = '${briefingKey}';
  `);
  assert(
    finalState === "delivered|2|t|t",
    `unexpected final delivery state: ${finalState}`,
  );

  const attempts = await Promise.all(
    Array.from({ length: 10 }, () =>
      query(`select public.allow_premium_briefing_attempt('${rateHash}');`),
    ),
  );
  const allowed = attempts.filter((value) => value === "t").length;
  const denied = attempts.filter((value) => value === "f").length;
  assert(allowed === 5, `expected five allowed attempts, got ${allowed}`);
  assert(denied === 5, `expected five denied attempts, got ${denied}`);

  console.log(
    "Database concurrency OK: 1/8 lease winner, stale token fenced, 5/10 rate attempts allowed.",
  );
} finally {
  cleanup();
}
