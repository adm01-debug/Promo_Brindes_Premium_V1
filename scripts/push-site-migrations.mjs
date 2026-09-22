import { spawnSync } from "node:child_process";

const ref = "whwloseshzraipljisqo";
const host = process.env.SUPABASE_DB_POOLER_HOST;
const password = process.env.SUPABASE_DB_PASSWORD;
if (
  process.env.SUPABASE_PROJECT_REF !== ref ||
  host !== "aws-0-us-east-2.pooler.supabase.com" ||
  !password
) {
  throw new Error(
    "Approved site database configuration is missing or mismatched.",
  );
}
const url = new URL(`postgresql://postgres.${ref}@${host}:5432/postgres`);
url.password = password;
url.searchParams.set("sslmode", "require");
const args = [
  "db",
  "push",
  "--db-url",
  url.toString(),
  "--skip-vault",
  "--yes",
];
if (process.argv.includes("--dry-run")) args.push("--dry-run");
const result = spawnSync("supabase", args, { stdio: "inherit" });
process.exit(result.status ?? 1);
