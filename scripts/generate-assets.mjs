/**
 * BRO'S placeholder art pipeline.
 *
 * Renders art-directed placeholder imagery (product views + campaign scenes)
 * from the demo catalogue into /public/images as WebP. Real photography can
 * replace any file 1:1 — keep the same path, or update src/data/media.ts.
 *
 *   npm run assets              # everything
 *   npm run assets -- products  # product views only
 *   npm run assets -- campaign  # campaign scenes only
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as S from "./lib/scenes.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = (...p) => path.join(root, "public", "images", ...p);
const load = (p) => import(pathToFileURL(path.join(root, p)).href);

const { productSeeds } = await load("src/data/products.ts");
const { colourMap } = await load("src/data/colours.ts");

const only = process.argv[2];

async function render(svg, file, width, quality = 80) {
  await mkdir(path.dirname(file), { recursive: true });
  const [, w] = svg.match(/width="(\d+)"/);
  const density = Math.min(72 * (width / Number(w)) * 1.0001, 600);
  await sharp(Buffer.from(svg), { density })
    .resize(width)
    [file.endsWith('.jpg') ? 'jpeg' : 'webp']({ quality, effort: 5, mozjpeg: true })
    .toFile(file);
}

async function pool(jobs, size = 4) {
  let i = 0;
  let done = 0;
  const workers = Array.from({ length: size }, async () => {
    while (i < jobs.length) {
      const job = jobs[i++];
      await job();
      done++;
      if (done % 10 === 0 || done === jobs.length) process.stdout.write(`  ${done}/${jobs.length}\r`);
    }
  });
  await Promise.all(workers);
  process.stdout.write("\n");
}

/* Product views ------------------------------------------------------ */

const VIEWS = {
  front: (t, hex) => S.productFront(t, hex, false),
  back: (t, hex) => S.productFront(t, hex, true),
  model: (t, hex) => S.productModel(t, hex),
  side: (t, hex) => S.productSide(t, hex),
  detail: (t, hex) => S.productDetail(t, hex),
  lifestyle: (t, hex) => S.productLifestyle(t, hex),
};

const productJobs = [];
for (const p of productSeeds) {
  for (const colourId of p.colourIds) {
    const hex = colourMap[colourId].hex;
    for (const [view, fn] of Object.entries(VIEWS)) {
      productJobs.push(() => render(fn(p.garment, hex), out("products", p.slug, `${colourId}-${view}.webp`), 1200, 78));
    }
  }
}

/* Campaign ------------------------------------------------------------ */

const campaignJobs = [
  ["hero-wide", () => S.heroWide(), 2400],
  ["hero-tall", () => S.heroTall(), 1200],
  ["category-men", () => S.categoryOutfit({ top: "longsleeve", topHex: "#3c3d40", bottom: "jogger", bottomHex: "#151515" }, "cm"), 1200],
  ["category-women", () => S.categoryOutfit({ top: "bra", topHex: "#151515", bottom: "legging", bottomHex: "#8b6e5a" }, "cw", true), 1200],
  ["category-tees", () => S.categoryTees(), 1200],
  ["category-shorts", () => S.categoryHanging("shorts", "#4b4f3d", "cs"), 1200],
  ["category-joggers", () => S.categoryHanging("jogger", "#3c3d40", "cj"), 1200],
  ["category-new-drop", () => S.categoryOutfit({ top: "oversized", topHex: "#e3ddd1", bottom: "jogger", bottomHex: "#1d2433" }, "cn"), 1200],
  ["lookbook-train", () => S.sceneTrain(), 2400],
  ["lookbook-train-tall", () => S.sceneTrain(1200, 1600), 1200],
  ["lookbook-move", () => S.sceneMove(), 2400],
  ["lookbook-move-tall", () => S.sceneMove(1200, 1600, "#4b4f3d", 7), 1200],
  ["lookbook-live", () => S.sceneArches(), 2400],
  ["lookbook-live-tall", () => S.sceneArches(1200, 1600), 1200],
  ["lookbook-rest", () => S.sceneRest(), 2400],
  ["lookbook-graphite", () => S.sceneMove(2400, 1350, "#3c3d40", 19), 2400],
  ["lookbook-clay", () => S.sceneMove(1200, 1500, "#8b6e5a", 23), 1200],
  ["lookbook-outfit-onyx", () => S.categoryOutfit({ top: "tee", topHex: "#151515", bottom: "shorts", bottomHex: "#3c3d40" }, "lo"), 1200],
  ["lookbook-outfit-bone", () => S.categoryOutfit({ top: "crop", topHex: "#e3ddd1", bottom: "legging", bottomHex: "#151515" }, "lb", true), 1200],
  ["community-track", () => S.sceneTrack(), 1200],
  ["community-chalk", () => S.sceneChalk(), 1200],
  ["community-plates", () => S.scenePlates(), 1200],
  ["community-rest", () => S.sceneRest(1200, 1500), 1200],
  ["tech-knit", () => S.sceneKnit(), 2400],
  ["tech-knit-bone", () => S.sceneKnit(1200, 1500, "#cfc9bd"), 1200],
  ["tech-knit-moss", () => S.sceneKnit(1200, 1500, "#4b4f3d"), 1200],
  ["about-arches", () => S.sceneArches(2400, 1350), 2400],
  ["og-default", () => S.ogCard(), 1200],
].map(([name, fn, width]) => () => render(fn(), out("campaign", `${name}.${name.startsWith("og-") ? "jpg" : "webp"}`), width, name.startsWith("og-") ? 85 : 80));

const t0 = Date.now();
if (!only || only === "campaign") {
  console.log(`Rendering ${campaignJobs.length} campaign scenes…`);
  await pool(campaignJobs, 3);
}
if (!only || only === "products") {
  console.log(`Rendering ${productJobs.length} product views…`);
  await pool(productJobs, 4);
}
console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
