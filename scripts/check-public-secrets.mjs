import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

const roots = ["src", "public"];
const textExtensions = new Set([".css", ".json", ".js", ".mjs", ".ts", ".tsx"]);
const findings = [];

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await inspect(path);
    else if (textExtensions.has(extname(entry.name))) {
      const content = await readFile(path, "utf8");
      const patterns = [
        /SUPABASE_(?:SERVICE_ROLE|SECRET)_KEY\s*[:=]\s*["']?[^\s"']{8,}/,
        /(?:sk_(?:live|proj)|service_role)[A-Za-z0-9_-]{16,}/,
        /postgres(?:ql)?:\/\/[^\s"']+:[^\s"']+@/,
      ];
      if (patterns.some((pattern) => pattern.test(content)))
        findings.push(path);
    }
  }
}

await Promise.all(roots.map(inspect));
if (findings.length) {
  console.error(`Possível segredo público em: ${findings.join(", ")}`);
  process.exit(1);
}
console.log("Verificação de segredos públicos: aprovada.");
