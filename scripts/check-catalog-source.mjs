import { readFile } from "node:fs/promises";
import {
  SOURCE_PROJECT_REF,
  verifyCuratedSource,
} from "./lib/catalog-source.mjs";

try {
  const snapshot = JSON.parse(await readFile("src/lib/products.json", "utf8"));
  const rows = await verifyCuratedSource(snapshot);
  console.log(
    `Source ${SOURCE_PROJECT_REF}: ${rows.length} active products verified with a public GET. No database writes.`,
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
