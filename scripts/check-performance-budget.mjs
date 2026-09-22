import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const imageDirectory = "public/images";
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
if (failures.length) {
  console.error(`Orçamento de assets reprovado: ${failures.join("; ")}`);
  process.exit(1);
}
console.log(
  `Orçamento de assets aprovado: ${imageFiles.length} WebP/AVIF; catálogo ${catalogBytes} bytes.`,
);
