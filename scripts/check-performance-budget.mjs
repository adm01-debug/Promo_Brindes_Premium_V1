import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const imageDirectory = "public/images";
const staticDirectory = ".next/static";
const routeStatsPath = ".next/diagnostics/route-bundle-stats.json";
const maxInitialJsGzipBytes = 200 * 1024;
const maxInitialFontBytes = 180 * 1024;
const maxInitialChunkCount = 10;
const files = await readdir(imageDirectory);
const imageFiles = files.filter((file) => /\.(avif|webp)$/i.test(file));
const failures = [];
let catalogBytes = 0;

for (const file of imageFiles) {
  const bytes = (await stat(join(imageDirectory, file))).size;
  if (file === "hero-gifting.webp" && bytes > 160 * 1024)
    failures.push(`${file} excede 160 KiB`);
  if (file !== "hero-gifting.webp") {
    catalogBytes += bytes;
    if (bytes > 100 * 1024) failures.push(`${file} excede 100 KiB`);
  }
}

if (catalogBytes > 256 * 1024)
  failures.push("o conjunto de imagens de catálogo excede 256 KiB");
if (files.some((file) => /\.(png|jpe?g)$/i.test(file)))
  failures.push("public/images contém original raster sem otimização");

const fontFiles = (await readdir(join(staticDirectory, "media"))).filter(
  (file) => file.endsWith(".woff2"),
);
const fontBytes = (
  await Promise.all(
    fontFiles.map((file) => stat(join(staticDirectory, "media", file))),
  )
).reduce((total, file) => total + file.size, 0);
if (fontBytes > maxInitialFontBytes)
  failures.push("as fontes WOFF2 excedem 180 KiB");

const routeStats = JSON.parse(await readFile(routeStatsPath, "utf8"));
for (const route of routeStats) {
  const chunks = route.firstLoadChunkPaths;
  const jsGzipBytes = (
    await Promise.all(
      chunks.map(async (chunk) => gzipSync(await readFile(chunk)).byteLength),
    )
  ).reduce((total, bytes) => total + bytes, 0);
  if (jsGzipBytes > maxInitialJsGzipBytes)
    failures.push(`${route.route} excede 200 KiB gzip de JavaScript inicial`);
  if (chunks.length > maxInitialChunkCount)
    failures.push(
      `${route.route} excede ${maxInitialChunkCount} chunks iniciais`,
    );
}
if (failures.length) {
  console.error(`Orçamento de assets reprovado: ${failures.join("; ")}`);
  process.exit(1);
}
console.log(
  `Orçamento aprovado: ${imageFiles.length} WebP/AVIF; catálogo ${catalogBytes} bytes; fontes WOFF2 ${fontBytes} bytes; ${routeStats.length} rotas de build medidas.`,
);
