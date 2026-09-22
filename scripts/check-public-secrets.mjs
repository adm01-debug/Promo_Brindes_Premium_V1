import { access, readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

const roots = ["src", "public", "scripts", ".next/static"];
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".map",
  ".mjs",
  ".ts",
  ".tsx",
]);
const findings = [];
let inspected = 0;

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await inspect(path);
    else if (textExtensions.has(extname(entry.name))) {
      inspected++;
      const content = await readFile(path, "utf8");
      const patterns = [
        /SUPABASE_(?:SERVICE_ROLE|SECRET)_KEY\s*[:=]\s*["']?[^\s"']{8,}/,
        /sb_secret_[A-Za-z0-9_-]{16,}/,
        /(?:sk_(?:live|proj)|service_role)[A-Za-z0-9_-]{16,}/,
        /postgres(?:ql)?:\/\/[^\s"']+:[^\s"']+@/,
      ];
      if (patterns.some((pattern) => pattern.test(content)))
        findings.push(path);
    }
  }
}

for (const root of roots) {
  try {
    await access(root);
    await inspect(root);
  } catch (error) {
    if (
      !error ||
      typeof error !== "object" ||
      !("code" in error) ||
      error.code !== "ENOENT"
    )
      throw error;
  }
}
if (findings.length) {
  console.error(`Possível segredo público em: ${findings.join(", ")}`);
  process.exit(1);
}
console.log(
  `Verificação de segredos públicos: aprovada em ${inspected} arquivos públicos e de build.`,
);
