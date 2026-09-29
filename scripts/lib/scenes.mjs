/**
 * Scene compositions for placeholder imagery: product views and campaign art.
 * Everything returns a complete SVG document string.
 */
import { garmentSVG, garmentFilters, garmentBox, garmentAnchors, isBottom } from "./garments.mjs";
import { shade, isLight } from "./color.mjs";

const CX = 500;

const svgDoc = (w, h, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${garmentFilters}${sharedDefs}${defs}</defs>${body}</svg>`;

const sharedDefs = `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="11" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="table" tableValues="0 0.9"/></feComponentTransfer>
  </filter>
  <filter id="soft" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="8000" height="8000"><feGaussianBlur stdDeviation="40"/></filter>
  <filter id="softer" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="8000" height="8000"><feGaussianBlur stdDeviation="90"/></filter>
  <filter id="soft-sm" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="8000" height="8000"><feGaussianBlur stdDeviation="12"/></filter>
  <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8d8d8d"/><stop offset="0.45" stop-color="#e2e2e2"/><stop offset="0.55" stop-color="#6b6b6b"/><stop offset="1" stop-color="#2b2b2b"/>
  </linearGradient>
  <linearGradient id="metal-v" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#2b2b2b"/><stop offset="0.35" stop-color="#9a9a9a"/><stop offset="0.5" stop-color="#d8d8d8"/><stop offset="1" stop-color="#1c1c1c"/>
  </linearGradient>
  <linearGradient id="form-cyl" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#3a3a3a"/><stop offset="0.3" stop-color="#1e1e1e"/><stop offset="0.75" stop-color="#101010"/><stop offset="1" stop-color="#262626"/>
  </linearGradient>`;

const grain = (w, h, o = 0.07) => `<rect width="${w}" height="${h}" filter="url(#grain)" opacity="${o}"/>`;

const vignette = (w, h, id, o = 0.7) =>
  `<radialGradient id="${id}" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${o}"/></radialGradient><rect width="${w}" height="${h}" fill="url(#${id})"/>`;

/** Fit a garment (or any box) into a target frame. Returns transform string. */
function fit(box, cx, cy, maxW, maxH) {
  const s = Math.min(maxW / (box.x1 - box.x0), maxH / (box.y1 - box.y0));
  return { s, t: `translate(${cx} ${cy}) scale(${s.toFixed(4)}) translate(${-(box.x0 + box.x1) / 2} ${-(box.y0 + box.y1) / 2})` };
}

/* ------------------------------------------------------------------ */
/* Backgrounds                                                          */
/* ------------------------------------------------------------------ */

function lightStudio(w, h) {
  return `
  <linearGradient id="bg-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecebe7"/><stop offset="1" stop-color="#d9d7d1"/></linearGradient>
  <radialGradient id="bg-l-glow" cx="0.5" cy="0.42" r="0.6"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <rect width="${w}" height="${h}" fill="url(#bg-l)"/><rect width="${w}" height="${h}" fill="url(#bg-l-glow)"/>`;
}

function greyStudio(w, h) {
  return `
  <linearGradient id="bg-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e8b85"/><stop offset="1" stop-color="#55534f"/></linearGradient>
  <radialGradient id="bg-g-glow" cx="0.5" cy="0.38" r="0.55"><stop offset="0" stop-color="#d6d2ca" stop-opacity="0.6"/><stop offset="1" stop-color="#d6d2ca" stop-opacity="0"/></radialGradient>
  <rect width="${w}" height="${h}" fill="url(#bg-g)"/><rect width="${w}" height="${h}" fill="url(#bg-g-glow)"/>`;
}

/** Dark studio with a top spotlight and a floor. */
function darkStudio(w, h, { spotX = w / 2, floorY = h * 0.84, warm = false, id = "ds", strength = 1 } = {}) {
  const lightCol = warm ? "#e9d8c0" : "#dfe3e8";
  return `
  <linearGradient id="${id}-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1b1c"/><stop offset="1" stop-color="#0c0c0c"/></linearGradient>
  <linearGradient id="${id}-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1a1a"/><stop offset="1" stop-color="#070707"/></linearGradient>
  <radialGradient id="${id}-spot" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${lightCol}" stop-opacity="${0.26 * strength}"/><stop offset="1" stop-color="${lightCol}" stop-opacity="0"/></radialGradient>
  <linearGradient id="${id}-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lightCol}" stop-opacity="${0.16 * strength}"/><stop offset="1" stop-color="${lightCol}" stop-opacity="0"/></linearGradient>
  <rect width="${w}" height="${h}" fill="url(#${id}-wall)"/>
  <rect y="${floorY}" width="${w}" height="${h - floorY}" fill="url(#${id}-floor)"/>
  <ellipse cx="${spotX}" cy="${h * 0.38}" rx="${w * 0.42}" ry="${h * 0.5}" fill="url(#${id}-spot)"/>
  <path d="M${spotX - w * 0.04} 0 L${spotX + w * 0.04} 0 L${spotX + w * 0.28} ${floorY} L${spotX - w * 0.28} ${floorY} Z" fill="url(#${id}-cone)" filter="url(#soft)"/>
  <ellipse cx="${spotX}" cy="${floorY + (h - floorY) * 0.35}" rx="${w * 0.26}" ry="${(h - floorY) * 0.28}" fill="${lightCol}" fill-opacity="${0.1 * strength}" filter="url(#soft)"/>
  <rect y="${floorY - 1}" width="${w}" height="2" fill="#fff" fill-opacity="0.05"/>`;
}

function haze(w, h, o = 0.08) {
  return `<ellipse cx="${w * 0.3}" cy="${h * 0.6}" rx="${w * 0.4}" ry="${h * 0.2}" fill="#9aa0a6" fill-opacity="${o}" filter="url(#softer)"/>
  <ellipse cx="${w * 0.75}" cy="${h * 0.45}" rx="${w * 0.35}" ry="${h * 0.18}" fill="#9aa0a6" fill-opacity="${o * 0.8}" filter="url(#softer)"/>`;
}

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

/** Tailor's form for tops, drawn in garment design space. */
function formTop(type) {
  const a = garmentAnchors(type);
  const hemX = a.hemX ?? 210;
  const hemY = a.hemY;
  const neckTop = a.neckY - 120;
  return `
  <rect x="${CX - 46}" y="${neckTop}" width="92" height="${a.neckY - neckTop + 40}" fill="url(#form-cyl)"/>
  <ellipse cx="${CX}" cy="${neckTop}" rx="46" ry="12" fill="#2e2e2e"/>
  <rect x="${CX - 12}" y="${neckTop - 26}" width="24" height="26" fill="url(#metal-v)"/>
  <path d="M${CX - hemX + 12} ${hemY - 80} C${CX - hemX + 6} ${hemY + 30} ${CX - hemX + 40} ${hemY + 90} ${CX - 60} ${hemY + 110} L${CX + 60} ${hemY + 110} C${CX + hemX - 40} ${hemY + 90} ${CX + hemX - 6} ${hemY + 30} ${CX + hemX - 12} ${hemY - 80} Z" fill="url(#form-cyl)"/>
  <rect x="${CX - 10}" y="${hemY + 100}" width="20" height="900" fill="url(#metal-v)"/>`;
}

/** Tailor's form for bottoms. */
function formBottom(type) {
  const a = garmentAnchors(type);
  const wy = a.waistY;
  const ww = a.waistW;
  return `
  <path d="M${CX - ww + 8} ${wy + 20} C${CX - ww - 4} ${wy - 120} ${CX - 196} ${wy - 250} ${CX - 182} ${wy - 360} L${CX + 182} ${wy - 360} C${CX + 196} ${wy - 250} ${CX + ww + 4} ${wy - 120} ${CX + ww - 8} ${wy + 20} Z" fill="url(#form-cyl)"/>
  <ellipse cx="${CX}" cy="${wy - 360}" rx="182" ry="26" fill="#2c2c2c"/>
  <rect x="${CX - 10}" y="${a.crotch}" width="20" height="1200" fill="url(#metal-v)"/>`;
}

function hangerTop(type) {
  const a = garmentAnchors(type);
  const y = a.neckY;
  return `
  <path d="M${CX} ${y - 10} L${CX} ${y - 70} C${CX} ${y - 110} ${CX + 44} ${y - 112} ${CX + 44} ${y - 150} C${CX + 44} ${y - 178} ${CX + 12} ${y - 190} ${CX - 8} ${y - 176}" fill="none" stroke="url(#metal-v)" stroke-width="9" stroke-linecap="round"/>
  <path d="M${CX - a.shX + 20} ${y + 70} L${CX} ${y - 14} L${CX + a.shX - 20} ${y + 70}" fill="none" stroke="#3a3a3a" stroke-width="14" stroke-linejoin="round"/>`;
}

function hangerBottom(type) {
  const a = garmentAnchors(type);
  const y = a.waistY - 36;
  const x = a.waistW - 36;
  return `
  <path d="M${CX} ${y} L${CX} ${y - 50} C${CX} ${y - 90} ${CX + 44} ${y - 92} ${CX + 44} ${y - 130} C${CX + 44} ${y - 158} ${CX + 12} ${y - 170} ${CX - 8} ${y - 156}" fill="none" stroke="url(#metal-v)" stroke-width="9" stroke-linecap="round"/>
  <rect x="${CX - x - 30}" y="${y - 8}" width="${(x + 30) * 2}" height="16" rx="8" fill="url(#metal)"/>
  <rect x="${CX - x - 18}" y="${y}" width="36" height="58" rx="4" fill="#2a2a2a"/>
  <rect x="${CX + x - 18}" y="${y}" width="36" height="58" rx="4" fill="#2a2a2a"/>`;
}

function kettlebell(x, y, s = 1, id = "kb") {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <radialGradient id="${id}-g" cx="0.35" cy="0.35" r="0.75"><stop offset="0" stop-color="#4a4a4a"/><stop offset="0.6" stop-color="#1a1a1a"/><stop offset="1" stop-color="#0a0a0a"/></radialGradient>
    <ellipse cx="0" cy="118" rx="120" ry="18" fill="#000" fill-opacity="0.6" filter="url(#soft-sm)"/>
    <path d="M-70 -40 C-80 -130 80 -130 70 -40" fill="none" stroke="#1d1d1d" stroke-width="34"/>
    <path d="M-70 -40 C-80 -130 80 -130 70 -40" fill="none" stroke="#fff" stroke-opacity="0.12" stroke-width="4" transform="translate(0 -14)"/>
    <circle cx="0" cy="20" r="104" fill="url(#${id}-g)"/>
    <path d="M-96 -10 A104 104 0 0 1 40 -76" fill="none" stroke="#fff" stroke-opacity="0.18" stroke-width="3"/>
  </g>`;
}

/** A neatly folded tee, centred on (0,0), approx 520 × 300. */
function foldedTee(hex, id) {
  const light = isLight(hex);
  const d = shade(hex, -0.5);
  return `<g>
    <linearGradient id="${id}-f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(hex, light ? 0.1 : 0.12)}"/><stop offset="1" stop-color="${shade(hex, light ? -0.12 : -0.25)}"/></linearGradient>
    <rect x="-262" y="-78" width="524" height="156" rx="16" fill="url(#${id}-f)"/>
    <rect x="-262" y="-78" width="524" height="156" rx="16" fill="none" stroke="${d}" stroke-opacity="0.5" stroke-width="2"/>
    <path d="M-60 -78 C-50 -44 50 -44 60 -78" fill="${shade(hex, light ? -0.2 : -0.35)}"/>
    <path d="M-60 -78 C-50 -44 50 -44 60 -78" fill="none" stroke="${shade(hex, light ? -0.06 : 0.06)}" stroke-width="12"/>
    <path d="M-180 -76 L-180 76 M180 -76 L180 76" stroke="${d}" stroke-opacity="0.22" stroke-width="3"/>
    <rect x="-262" y="54" width="524" height="24" rx="10" fill="#000" fill-opacity="0.12"/>
    <text x="0" y="12" font-family="Arial Black, Arial" font-weight="900" font-size="22" letter-spacing="3" text-anchor="middle" fill="${light ? "#1d1d1d" : "#dedad2"}" fill-opacity="0.8">BRO&#8217;S</text>
  </g>`;
}

/* ------------------------------------------------------------------ */
/* Product views                                                        */
/* ------------------------------------------------------------------ */

const W = 1000;
const H = 1250;

export function productFront(type, hex, back = false) {
  const { t } = fit(garmentBox(type), 500, 640, 760, 980);
  return svgDoc(W, H, "", `${lightStudio(W, H)}<g transform="${t}">${garmentSVG(type, hex, { id: "g", back })}</g>${grain(W, H, 0.04)}`);
}

export function productSide(type, hex) {
  const { t } = fit(garmentBox(type), 500, 640, 760, 980);
  return svgDoc(
    W,
    H,
    `<linearGradient id="side-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0.3" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.28"/></linearGradient>`,
    `${lightStudio(W, H)}<g transform="translate(500 0) scale(0.8 1) skewY(-3) translate(-500 20)"><g transform="${t}">${garmentSVG(type, hex, { id: "g" })}</g></g>
    <rect width="${W}" height="${H}" fill="url(#side-shade)" opacity="0.5"/>${grain(W, H, 0.04)}`,
  );
}

export function productModel(type, hex) {
  const bottom = isBottom(type);
  const box = garmentBox(type);
  const a = garmentAnchors(type);
  const frame = bottom
    ? { x0: box.x0 - 30, x1: box.x1 + 30, y0: a.waistY - 360, y1: box.y1 + 60 }
    : { x0: box.x0 - 30, x1: box.x1 + 30, y0: a.neckY - 150, y1: a.hemY + 170 };
  const { t } = fit(frame, 500, 625, 860, 1180);
  const form = bottom ? formBottom(type) : formTop(type);
  return svgDoc(W, H, "", `${greyStudio(W, H)}<ellipse cx="500" cy="1200" rx="330" ry="40" fill="#000" fill-opacity="0.35" filter="url(#soft)"/><g transform="${t}">${form}${garmentSVG(type, hex, { id: "g", light: 0.6 })}</g>${grain(W, H, 0.05)}`);
}

export function productLifestyle(type, hex) {
  const bottom = isBottom(type);
  const box = garmentBox(type);
  const a = garmentAnchors(type);
  const frame = bottom
    ? { x0: box.x0 - 80, x1: box.x1 + 80, y0: a.waistY - 240, y1: box.y1 + 160 }
    : { x0: box.x0 - 80, x1: box.x1 + 80, y0: a.neckY - 260, y1: box.y1 + 160 };
  const { t } = fit(frame, 470, 560, 720, 900);
  const railY = 120;
  return svgDoc(
    W,
    H,
    "",
    `${darkStudio(W, H, { spotX: 470, floorY: 1030, id: "ls", strength: 1.3 })}
    <rect x="0" y="${railY - 5}" width="${W}" height="10" fill="url(#metal)"/>
    <ellipse cx="470" cy="1080" rx="240" ry="26" fill="#000" fill-opacity="0.6" filter="url(#soft-sm)"/>
    <g transform="${t}">${bottom ? hangerBottom(type) : hangerTop(type)}${garmentSVG(type, hex, { id: "g", light: 0.8 })}</g>
    ${kettlebell(830, 1010, 0.62, "kb")}
    ${vignette(W, H, "ls-v", 0.55)}${grain(W, H, 0.07)}`,
  );
}

export function productDetail(type, hex) {
  const light = isLight(hex);
  const woven = type === "shorts" || type === "short-shorts";
  const hi = shade(hex, light ? 0.12 : 0.16);
  const lo = shade(hex, light ? -0.18 : -0.35);
  const pattern = woven
    ? `<pattern id="knit" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="scale(2.2) rotate(8)"><rect width="14" height="14" fill="${lo}"/><rect x="0" y="0" width="7" height="7" fill="${hi}"/><rect x="7" y="7" width="7" height="7" fill="${hi}"/><rect x="0" y="0" width="14" height="1" fill="#000" fill-opacity="0.15"/></pattern>`
    : `<pattern id="knit" width="16" height="13" patternUnits="userSpaceOnUse" patternTransform="scale(3) rotate(4)"><rect width="16" height="13" fill="${lo}"/><ellipse cx="5" cy="6.5" rx="2.6" ry="7.4" fill="${hi}" transform="rotate(-26 5 6.5)"/><ellipse cx="11" cy="6.5" rx="2.6" ry="7.4" fill="${hi}" transform="rotate(26 11 6.5)"/><ellipse cx="5" cy="4.5" rx="1.1" ry="4.6" fill="#fff" fill-opacity="0.18" transform="rotate(-26 5 4.5)"/><ellipse cx="11" cy="4.5" rx="1.1" ry="4.6" fill="#fff" fill-opacity="0.18" transform="rotate(26 11 4.5)"/><rect x="0" y="0" width="1.2" height="13" fill="#000" fill-opacity="0.35"/></pattern>`;
  const ink = light ? "#1d1d1d" : "#dedad2";
  return svgDoc(
    W,
    H,
    `${pattern}
    <filter id="warp" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.006" numOctaves="2" seed="3" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="36"/></filter>
    <radialGradient id="dl" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#fff" stop-opacity="${light ? 0.25 : 0.16}"/><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>`,
    `<rect width="${W}" height="${H}" fill="${hex}"/>
    <g filter="url(#warp)"><rect x="-100" y="-100" width="1200" height="1450" fill="url(#knit)"/></g>
    <path d="M-50 860 C 300 800 700 900 1050 820 L1050 1300 L-50 1300 Z" fill="${shade(hex, light ? -0.08 : 0.04)}"/>
    <path d="M-50 860 C 300 800 700 900 1050 820" fill="none" stroke="#000" stroke-opacity="0.35" stroke-width="10" filter="url(#soft-sm)"/>
    <path d="M-50 900 C 300 840 700 940 1050 860" fill="none" stroke="${light ? shade(hex, -0.45) : shade(hex, 0.4)}" stroke-width="4" stroke-dasharray="16 10" stroke-linecap="round"/>
    <path d="M-50 940 C 300 880 700 980 1050 900" fill="none" stroke="${light ? shade(hex, -0.45) : shade(hex, 0.4)}" stroke-width="4" stroke-dasharray="16 10" stroke-linecap="round"/>
    <g transform="translate(560 1020) rotate(-3)"><rect x="-150" y="-50" width="300" height="100" fill="${light ? "#161616" : "#e6e1d6"}"/><text x="0" y="16" font-family="Arial Black, Arial" font-weight="900" font-size="44" letter-spacing="7" text-anchor="middle" fill="${light ? "#e6e1d6" : "#161616"}">BRO&#8217;S</text></g>
    <rect width="${W}" height="${H}" fill="url(#dl)"/>
    ${grain(W, H, 0.06)}
    <text x="60" y="1200" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4" fill="${ink}" fill-opacity="0.45">FABRIC DETAIL</text>`,
  );
}

/* ------------------------------------------------------------------ */
/* Campaign scenes                                                      */
/* ------------------------------------------------------------------ */

/** A full outfit (top + optional bottom) on a form, in outfit design space. */
function outfit({ top, topHex, bottom, bottomHex }, idp) {
  const ta = garmentAnchors(top);
  let body = "";
  let bottomOffset = 0;
  if (bottom) {
    const ba = garmentAnchors(bottom);
    const overlap = top === "bra" ? -90 : 230;
    bottomOffset = ta.hemY - overlap - ba.waistY;
  }
  const hipsY = bottom ? garmentAnchors(bottom).crotch + bottomOffset : ta.hemY + 100;
  body += `<rect x="${CX - 46}" y="${ta.neckY - 120}" width="92" height="170" fill="url(#form-cyl)"/>
  <ellipse cx="${CX}" cy="${ta.neckY - 120}" rx="46" ry="12" fill="#2e2e2e"/>
  <rect x="${CX - 12}" y="${ta.neckY - 146}" width="24" height="26" fill="url(#metal-v)"/>
  <path d="M${CX - 190} ${ta.neckY + 80} C${CX - 200} ${ta.neckY + 300} ${CX - 140} ${ta.neckY + 470} ${CX - 150} ${ta.neckY + 560} C${CX - 170} ${hipsY - 200} ${CX - 190} ${hipsY - 80} ${CX - 60} ${hipsY} L${CX + 60} ${hipsY} C${CX + 190} ${hipsY - 80} ${CX + 170} ${hipsY - 200} ${CX + 150} ${ta.neckY + 560} C${CX + 140} ${ta.neckY + 470} ${CX + 200} ${ta.neckY + 300} ${CX + 190} ${ta.neckY + 80} Z" fill="url(#form-cyl)"/>
  <rect x="${CX - 10}" y="${hipsY - 10}" width="20" height="2000" fill="url(#metal-v)"/>`;
  if (bottom) body += `<g transform="translate(0 ${bottomOffset})">${garmentSVG(bottom, bottomHex, { id: `${idp}-b`, light: 0.5 })}</g>`;
  body += garmentSVG(top, topHex, { id: `${idp}-t`, light: 0.5 });
  const tb = garmentBox(top);
  const bb = bottom ? garmentBox(bottom) : null;
  const box = {
    x0: Math.min(tb.x0, bb ? bb.x0 : tb.x0),
    x1: Math.max(tb.x1, bb ? bb.x1 : tb.x1),
    y0: ta.neckY - 150,
    y1: bb ? bb.y1 + bottomOffset : tb.y1 + 200,
  };
  return { body, box };
}

function outfitScene(w, h, look, { cx, floorY, height, spotX, warm, id, rim = true }) {
  const o = outfit(look, id);
  const s = height / (o.box.y1 - o.box.y0);
  const tx = cx - CX * s;
  const ty = floorY - 20 - o.box.y1 * s;
  return `${darkStudio(w, h, { spotX: spotX ?? cx, floorY, warm, id: `${id}-ds`, strength: 1.2 })}
  ${rim ? `<ellipse cx="${cx}" cy="${floorY - height * 0.55}" rx="${height * 0.34}" ry="${height * 0.55}" fill="#c9ced4" fill-opacity="0.13" filter="url(#softer)"/>` : ""}
  <ellipse cx="${cx}" cy="${floorY + 6}" rx="${height * 0.2}" ry="${height * 0.025}" fill="#000" fill-opacity="0.7" filter="url(#soft-sm)"/>
  <g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${s.toFixed(4)})">${o.body}</g>`;
}

export function heroWide() {
  const w = 2400, h = 1350;
  return svgDoc(w, h, "", `${outfitScene(w, h, { top: "oversized", topHex: "#151515", bottom: "jogger", bottomHex: "#2a2b2e" }, { cx: 1640, floorY: 1240, height: 1120, id: "hw" })}${haze(w, h, 0.06)}${vignette(w, h, "hw-v", 0.75)}${grain(w, h, 0.08)}`);
}

export function heroTall() {
  const w = 1200, h = 1800;
  return svgDoc(w, h, "", `${outfitScene(w, h, { top: "oversized", topHex: "#151515", bottom: "jogger", bottomHex: "#2a2b2e" }, { cx: 600, floorY: 1650, height: 1180, id: "ht" })}${haze(w, h, 0.06)}${vignette(w, h, "ht-v", 0.75)}${grain(w, h, 0.08)}`);
}

export function categoryOutfit(look, id, warm = false) {
  const w = 1200, h = 1500;
  return svgDoc(w, h, "", `${outfitScene(w, h, look, { cx: 600, floorY: 1390, height: 1160, id, warm })}${vignette(w, h, `${id}-v`, 0.7)}${grain(w, h, 0.08)}`);
}

export function categoryTees() {
  const w = 1200, h = 1500;
  const stack = [
    ["#3c3d40", 0],
    ["#a3a09a", 1],
    ["#e3ddd1", 2],
    ["#151515", 3],
  ];
  const plinth = `<rect x="260" y="1060" width="680" height="360" fill="#1f1f1f"/><rect x="260" y="1060" width="680" height="6" fill="#fff" fill-opacity="0.08"/><linearGradient id="pl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.4"/><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/></linearGradient><rect x="260" y="1060" width="680" height="360" fill="url(#pl)"/>`;
  const tees = stack
    .map(([hex, i]) => `<g transform="translate(${600 + (i % 2 ? 8 : -6)} ${1000 - i * 150}) rotate(${i % 2 ? 0.8 : -0.6})"><ellipse cx="0" cy="84" rx="270" ry="14" fill="#000" fill-opacity="0.45" filter="url(#soft-sm)"/>${foldedTee(hex, `ft${i}`)}</g>`)
    .join("");
  return svgDoc(w, h, "", `${darkStudio(w, h, { spotX: 600, floorY: 1420, id: "ct", strength: 1.3 })}${plinth}${tees}${vignette(w, h, "ct-v", 0.65)}${grain(w, h, 0.08)}`);
}

export function categoryHanging(type, hex, id) {
  const w = 1200, h = 1500;
  const box = garmentBox(type);
  const a = garmentAnchors(type);
  const frame = { x0: box.x0 - 80, x1: box.x1 + 80, y0: (a.waistY ?? a.neckY) - 260, y1: box.y1 + 120 };
  const { t } = fit(frame, 600, 700, 900, 1100);
  return svgDoc(
    w,
    h,
    "",
    `${darkStudio(w, h, { spotX: 600, floorY: 1300, id: `${id}-ds`, strength: 1.4 })}
    <rect x="0" y="95" width="${w}" height="10" fill="url(#metal)"/>
    <g transform="${t}">${isBottom(type) ? hangerBottom(type) : hangerTop(type)}${garmentSVG(type, hex, { id: "g", light: 0.8 })}</g>
    ${vignette(w, h, `${id}-v`, 0.6)}${grain(w, h, 0.08)}`,
  );
}

/** Power rack + loaded barbell in a dark gym. */
export function sceneTrain(w = 2400, h = 1350) {
  const fy = h * 0.86;
  const s = h / 1350;
  const X = (x) => (w / 2 + (x - 1200) * s).toFixed(1);
  const Y = (y) => (y * s).toFixed(1);
  const S = (v) => (v * s).toFixed(1);
  const upright = (x, y0, y1, width, o = 1) => {
    let holes = "";
    for (let y = y0 + 60; y < y1 - 80; y += 46) holes += `<rect x="${X(x + width / 2 - 5)}" y="${Y(y)}" width="${S(10)}" height="${S(18)}" rx="${S(3)}" fill="#000" fill-opacity="0.7"/>`;
    return `<rect x="${X(x)}" y="${Y(y0)}" width="${S(width)}" height="${S(y1 - y0)}" fill="url(#rack-g)" opacity="${o}"/>${holes}`;
  };
  const plates = (x, dir) =>
    [0, 1, 2]
      .map((i) => {
        const px = x + dir * i * 46;
        const r = 240 - i * 26;
        return `<ellipse cx="${X(px)}" cy="${Y(560)}" rx="${S(38)}" ry="${S(r)}" fill="#141414" stroke="#000" stroke-width="${S(4)}"/><ellipse cx="${X(px + dir * -10)}" cy="${Y(560)}" rx="${S(30)}" ry="${S(r - 10)}" fill="none" stroke="#fff" stroke-opacity="0.14" stroke-width="${S(3)}"/><ellipse cx="${X(px)}" cy="${Y(560)}" rx="${S(10)}" ry="${S(40)}" fill="#2a2a2a"/>`;
      })
      .join("");
  return svgDoc(
    w,
    h,
    `<linearGradient id="rack-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#101010"/><stop offset="0.4" stop-color="#2e2e2e"/><stop offset="0.6" stop-color="#1c1c1c"/><stop offset="1" stop-color="#080808"/></linearGradient>`,
    `${darkStudio(w, h, { spotX: w / 2, floorY: fy, id: "tr", strength: 1.5 })}
    ${upright(900, 330, 1110, 54, 0.55)}${upright(1446, 330, 1110, 54, 0.55)}
    <rect x="${X(900)}" y="${Y(310)}" width="${S(600)}" height="${S(34)}" fill="#1a1a1a" opacity="0.7"/>
    ${upright(640, 170, fy / s, 80)}${upright(1680, 170, fy / s, 80)}
    <rect x="${X(640)}" y="${Y(150)}" width="${S(1120)}" height="${S(46)}" fill="url(#rack-g)"/>
    <path d="M${X(640)} ${Y(196)} L${X(900)} ${Y(344)} M${X(1760)} ${Y(196)} L${X(1500)} ${Y(344)}" stroke="#1d1d1d" stroke-width="${S(20)}"/>
    <rect x="${X(250)}" y="${Y(551)}" width="${S(1900)}" height="${S(18)}" rx="${S(9)}" fill="url(#metal)"/>
    <rect x="${X(700)}" y="${Y(570)}" width="${S(40)}" height="${S(30)}" fill="#0e0e0e"/><rect x="${X(1660)}" y="${Y(570)}" width="${S(40)}" height="${S(30)}" fill="#0e0e0e"/>
    ${plates(470, -1)}${plates(1930, 1)}
    ${kettlebell(X(1920), Y(fy / s - 90), 0.9 * s, "kb1")}${kettlebell(X(2120), Y(fy / s - 70), 0.7 * s, "kb2")}
    ${haze(w, h, 0.1)}${vignette(w, h, "tr-v", 0.8)}${grain(w, h, 0.09)}`,
  );
}

/** Fabric in motion: lit turbulence surface. */
export function sceneMove(w = 2400, h = 1350, hex = "#4b4f3d", seed = 7) {
  return svgDoc(
    w,
    h,
    `<filter id="cloth" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.0009 0.0055" numOctaves="3" seed="${seed}" result="n"/>
      <feDiffuseLighting in="n" surfaceScale="38" diffuseConstant="1.1" lighting-color="#ffffff" result="l"><feDistantLight azimuth="235" elevation="38"/></feDiffuseLighting>
      <feColorMatrix in="l" type="saturate" values="0"/>
    </filter>
    <linearGradient id="mv-shade" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stop-color="#000" stop-opacity="0.1"/><stop offset="1" stop-color="#000" stop-opacity="0.75"/></linearGradient>`,
    `<rect width="${w}" height="${h}" filter="url(#cloth)"/>
    <rect width="${w}" height="${h}" fill="${hex}" style="mix-blend-mode:multiply"/>
    <rect width="${w}" height="${h}" fill="${hex}" opacity="0.35"/>
    <rect width="${w}" height="${h}" fill="url(#mv-shade)"/>
    ${vignette(w, h, "mv-v", 0.7)}${grain(w, h, 0.07)}`,
  );
}

/** Colonnade of pointed arches at night — a quiet nod to Hyderabad. */
export function sceneArches(w = 2400, h = 1350) {
  const fy = h * 0.8;
  const n = 5;
  const aw = w / n;
  let arches = "";
  for (let i = 0; i < n; i++) {
    const x0 = i * aw + aw * 0.16;
    const x1 = (i + 1) * aw - aw * 0.16;
    const cx = (x0 + x1) / 2;
    const ys = h * 0.4;
    const ya = h * 0.14;
    const d = `M${x0} ${fy} L${x0} ${ys} C${x0} ${ys - (ys - ya) * 0.6} ${cx - (x1 - x0) * 0.12} ${ya + (ys - ya) * 0.15} ${cx} ${ya} C${cx + (x1 - x0) * 0.12} ${ya + (ys - ya) * 0.15} ${x1} ${ys - (ys - ya) * 0.6} ${x1} ${ys} L${x1} ${fy} Z`;
    arches += `<path d="${d}" fill="url(#arch-in)"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity="0.06" stroke-width="3"/>`;
    // moonlight falling through each arch onto the floor
    arches += `<path d="M${x0 + 30} ${fy} L${x1 - 10} ${fy} L${x1 + aw * 0.55} ${h} L${x0 + aw * 0.5} ${h} Z" fill="#cfd6df" fill-opacity="0.08" filter="url(#soft-sm)"/>`;
  }
  return svgDoc(
    w,
    h,
    `<linearGradient id="arch-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a2927"/><stop offset="1" stop-color="#151514"/></linearGradient>
    <linearGradient id="arch-in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1117"/><stop offset="1" stop-color="#1e2530"/></linearGradient>
    <filter id="stone" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="4" seed="9"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.5"/></feComponentTransfer></filter>`,
    `<rect width="${w}" height="${h}" fill="url(#arch-wall)"/>
    <rect width="${w}" height="${fy}" filter="url(#stone)" opacity="0.35"/>
    ${arches}
    <rect y="${fy}" width="${w}" height="${h - fy}" fill="#0d0d0d"/>
    <rect y="${fy}" width="${w}" height="${h - fy}" filter="url(#stone)" opacity="0.2"/>
    <rect y="${fy - 2}" width="${w}" height="3" fill="#fff" fill-opacity="0.06"/>
    <ellipse cx="${w * 0.15}" cy="${h * 0.2}" rx="${w * 0.35}" ry="${h * 0.4}" fill="#b9c3cf" fill-opacity="0.08" filter="url(#softer)"/>
    ${vignette(w, h, "ar-v", 0.75)}${grain(w, h, 0.09)}`,
  );
}

/** Window-light slats across a concrete wall with a bench and folded kit. */
export function sceneRest(w = 2400, h = 1350) {
  const fy = h * 0.78;
  const slats = [0, 1, 2, 3, 4]
    .map((i) => {
      const x = w * 0.18 + i * w * 0.075;
      return `<path d="M${x} ${h * 0.08} L${x + w * 0.045} ${h * 0.08} L${x + w * 0.2} ${fy} L${x + w * 0.155} ${fy} Z" fill="#f0dfc4" fill-opacity="0.13" filter="url(#soft-sm)"/>
      <path d="M${x + w * 0.155} ${fy} L${x + w * 0.2} ${fy} L${x + w * 0.34} ${h} L${x + w * 0.27} ${h} Z" fill="#f0dfc4" fill-opacity="0.09" filter="url(#soft-sm)"/>`;
    })
    .join("");
  const bx = w * 0.55;
  const by = fy - h * 0.16;
  const bench = `<rect x="${bx}" y="${by}" width="${w * 0.34}" height="${h * 0.035}" fill="#2d2a26"/><rect x="${bx}" y="${by}" width="${w * 0.34}" height="3" fill="#fff" fill-opacity="0.1"/>
    <rect x="${bx + w * 0.02}" y="${by + h * 0.035}" width="${w * 0.018}" height="${fy - by - h * 0.035}" fill="#1a1816"/><rect x="${bx + w * 0.3}" y="${by + h * 0.035}" width="${w * 0.018}" height="${fy - by - h * 0.035}" fill="#1a1816"/>
    <ellipse cx="${bx + w * 0.17}" cy="${fy + 8}" rx="${w * 0.2}" ry="16" fill="#000" fill-opacity="0.5" filter="url(#soft-sm)"/>`;
  const k = h / 1350;
  const stack = `<g transform="translate(${bx + w * 0.11} ${by - 44 * k}) scale(${0.62 * k})">${foldedTee("#e3ddd1", "r1")}</g><g transform="translate(${bx + w * 0.112} ${by - 140 * k}) scale(${0.6 * k}) rotate(-1)">${foldedTee("#151515", "r2")}</g>`;
  return svgDoc(
    w,
    h,
    `<linearGradient id="rest-wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b2926"/><stop offset="1" stop-color="#121110"/></linearGradient>
    <filter id="conc" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" seed="21"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.45"/></feComponentTransfer></filter>`,
    `<rect width="${w}" height="${h}" fill="url(#rest-wall)"/><rect width="${w}" height="${h}" filter="url(#conc)" opacity="0.35"/>
    <rect y="${fy}" width="${w}" height="${h - fy}" fill="#121110"/><rect y="${fy - 1}" width="${w}" height="2" fill="#fff" fill-opacity="0.05"/>
    ${slats}${bench}${stack}
    ${vignette(w, h, "rs-v", 0.7)}${grain(w, h, 0.09)}`,
  );
}

/** Stacked bumper plates, top-lit. */
export function scenePlates(w = 1200, h = 1500) {
  const cx = w / 2;
  const k = w / 1200;
  let plates = "";
  for (let i = 0; i < 5; i++) {
    const y = h * 0.78 - i * 70 * k;
    const r = (380 - i * 18) * k;
    plates += `<ellipse cx="${cx}" cy="${y + 26 * k}" rx="${r}" ry="${r * 0.3}" fill="#0b0b0b"/><rect x="${cx - r}" y="${y}" width="${r * 2}" height="${26 * k}" fill="#101010"/>
    <ellipse cx="${cx}" cy="${y}" rx="${r}" ry="${r * 0.3}" fill="url(#plate-top)"/>
    <ellipse cx="${cx}" cy="${y}" rx="${r * 0.98}" ry="${r * 0.29}" fill="none" stroke="#fff" stroke-opacity="0.1" stroke-width="2"/>
    <ellipse cx="${cx}" cy="${y}" rx="${r * 0.62}" ry="${r * 0.186}" fill="none" stroke="#000" stroke-opacity="0.5" stroke-width="3"/>`;
  }
  const top = h * 0.78 - 4 * 70 * k;
  plates += `<ellipse cx="${cx}" cy="${top}" rx="${60 * k}" ry="${18 * k}" fill="url(#metal)"/><ellipse cx="${cx}" cy="${top}" rx="${30 * k}" ry="${9 * k}" fill="#050505"/>`;
  return svgDoc(
    w,
    h,
    `<radialGradient id="plate-top" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stop-color="#3a3a3a"/><stop offset="1" stop-color="#141414"/></radialGradient>`,
    `${darkStudio(w, h, { spotX: cx, floorY: h * 0.82, id: "pl", strength: 1.3 })}${plates}${vignette(w, h, "pl-v", 0.7)}${grain(w, h, 0.09)}`,
  );
}

/** Running track lanes at night, seen low and wide. */
export function sceneTrack(w = 1200, h = 1500) {
  let lanes = "";
  for (let i = -6; i <= 6; i++) {
    const xb = w / 2 + i * w * 0.26;
    lanes += `<path d="M${w / 2 + i * w * 0.018} ${h * 0.34} L${xb} ${h}" stroke="#e8e4dc" stroke-opacity="0.5" stroke-width="${Math.max(2, 7 - Math.abs(i) * 0.4)}"/>`;
  }
  return svgDoc(
    w,
    h,
    `<linearGradient id="trk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1413"/><stop offset="1" stop-color="#3a2a26"/></linearGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07090c"/><stop offset="1" stop-color="#1b2029"/></linearGradient>
    <filter id="rub" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.6"/></feComponentTransfer></filter>`,
    `<rect width="${w}" height="${h * 0.34}" fill="url(#sky)"/>
    <ellipse cx="${w * 0.8}" cy="${h * 0.3}" rx="${w * 0.5}" ry="${h * 0.12}" fill="#d9dde3" fill-opacity="0.12" filter="url(#softer)"/>
    <rect y="${h * 0.34}" width="${w}" height="${h * 0.66}" fill="url(#trk)"/>
    <rect y="${h * 0.34}" width="${w}" height="${h * 0.66}" filter="url(#rub)" opacity="0.4"/>
    ${lanes}
    <rect y="${h * 0.34 - 2}" width="${w}" height="4" fill="#fff" fill-opacity="0.08"/>
    ${vignette(w, h, "tk-v", 0.75)}${grain(w, h, 0.08)}`,
  );
}

/** Chalk dust bloom on black. */
export function sceneChalk(w = 1200, h = 1500) {
  return svgDoc(
    w,
    h,
    `<filter id="dust" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="5" seed="13" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.92  0 0 0 0 0.91  0 0 0 0 0.89  0 0 0 2.4 -1.05" result="c"/>
      <feComposite in="c" in2="SourceGraphic" operator="in"/>
    </filter>
    <radialGradient id="dust-mask" cx="0.5" cy="0.55" r="0.5"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
    `<rect width="${w}" height="${h}" fill="#0c0c0c"/>
    <ellipse cx="${w * 0.52}" cy="${h * 0.55}" rx="${w * 0.55}" ry="${h * 0.38}" fill="url(#dust-mask)" filter="url(#dust)"/>
    <ellipse cx="${w * 0.52}" cy="${h * 0.55}" rx="${w * 0.2}" ry="${h * 0.14}" fill="#fff" fill-opacity="0.1" filter="url(#softer)"/>
    ${vignette(w, h, "ch-v", 0.8)}${grain(w, h, 0.1)}`,
  );
}

/** Macro of the knit for technology & lookbook. */
export function sceneKnit(w = 2400, h = 1350, hex = "#1c1c1d") {
  const hi = shade(hex, 0.2);
  const lo = shade(hex, -0.4);
  return svgDoc(
    w,
    h,
    `<pattern id="kn" width="16" height="13" patternUnits="userSpaceOnUse" patternTransform="scale(${(4 * h) / 1350}) rotate(-6)"><rect width="16" height="13" fill="${lo}"/><ellipse cx="5" cy="6.5" rx="2.6" ry="7.4" fill="${hi}" transform="rotate(-26 5 6.5)"/><ellipse cx="11" cy="6.5" rx="2.6" ry="7.4" fill="${hi}" transform="rotate(26 11 6.5)"/><ellipse cx="5" cy="4.5" rx="1.1" ry="4.6" fill="#fff" fill-opacity="0.18" transform="rotate(-26 5 4.5)"/><ellipse cx="11" cy="4.5" rx="1.1" ry="4.6" fill="#fff" fill-opacity="0.18" transform="rotate(26 11 4.5)"/><rect x="0" y="0" width="1.2" height="13" fill="#000" fill-opacity="0.35"/></pattern>
    <filter id="kwarp" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.0025 0.004" numOctaves="2" seed="2" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="${(50 * h) / 1350}"/></filter>
    <radialGradient id="kl" cx="0.62" cy="0.35" r="0.7"><stop offset="0" stop-color="#fff" stop-opacity="0.2"/><stop offset="0.55" stop-color="#000" stop-opacity="0.1"/><stop offset="1" stop-color="#000" stop-opacity="0.8"/></radialGradient>`,
    `<rect width="${w}" height="${h}" fill="${hex}"/>
    <g filter="url(#kwarp)"><rect x="-200" y="-200" width="${w + 400}" height="${h + 400}" fill="url(#kn)"/></g>
    <rect width="${w}" height="${h}" fill="url(#kl)"/>
    ${grain(w, h, 0.06)}`,
  );
}

/** Minimal OG card. */
export function ogCard() {
  const w = 1200, h = 630;
  return svgDoc(
    w,
    h,
    "",
    `${darkStudio(w, h, { spotX: 900, floorY: 560, id: "og", strength: 1.2 })}
    <text x="80" y="330" font-family="Arial Black, Arial" font-weight="900" font-size="150" letter-spacing="10" fill="#ece8e0">BRO&#8217;S</text>
    <text x="86" y="400" font-family="Arial, sans-serif" font-weight="700" font-size="26" letter-spacing="10" fill="#ece8e0" fill-opacity="0.6">DROP 001 — ENGINEERED FOR MOVEMENT</text>
    ${grain(w, h, 0.08)}`,
  );
}
