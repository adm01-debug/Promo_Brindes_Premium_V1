import { readFile } from "node:fs/promises";
import {
  countActiveSourceProducts,
  SOURCE_PROJECT_REF,
  verifyCuratedSource,
} from "./lib/catalog-source.mjs";

try {
  const snapshot = JSON.parse(await readFile("src/lib/products.json", "utf8"));
  const rows = await verifyCuratedSource(snapshot);
  const activeTotal = await countActiveSourceProducts();
  console.log(
    `Source ${SOURCE_PROJECT_REF}: ${rows.length} curated product IDs verified among ${activeTotal} active public products. GET only; no database writes.`,
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
