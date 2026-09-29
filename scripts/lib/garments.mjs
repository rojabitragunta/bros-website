/**
 * Parametric garment renderer (SVG). All garments are drawn in a
 * 1000 × 1250 design space centred on x = 500. Used only to produce
 * placeholder product imagery until final brand photography exists.
 */
import { shade, isLight } from "./color.mjs";

const CX = 500;
const R = (x) => CX + x;
const L = (x) => CX - x;
const f = (n) => Number(n.toFixed(1));

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

const TOPS = {
  tee: { neckW: 82, neckY: 222, neckDrop: 62, backDrop: 16, shX: 232, shY: 272, sOut: [366, 470], sIn: [262, 522], under: [212, 452], hem: [210, 1062], taper: 0 },
  oversized: { neckW: 92, neckY: 228, neckDrop: 58, backDrop: 18, shX: 288, shY: 320, sOut: [400, 590], sIn: [300, 632], under: [276, 540], hem: [284, 1080], taper: 0 },
  crop: { neckW: 76, neckY: 262, neckDrop: 58, backDrop: 14, shX: 198, shY: 306, sOut: [292, 438], sIn: [226, 474], under: [182, 430], hem: [176, 770], taper: 20 },
  longsleeve: { neckW: 80, neckY: 222, neckDrop: 60, backDrop: 16, shX: 230, shY: 272, long: true, cuffOut: [350, 952], cuffIn: [282, 974], under: [210, 450], hem: [206, 1062], taper: 0 },
};

const TANKS = {
  tank: { neckW: 96, topY: 212, neckDrop: 240, backDrop: 110, strapOut: 172, armY: 540, side: 226, hem: [222, 1082] },
  muscle: { neckW: 102, topY: 212, neckDrop: 222, backDrop: 100, strapOut: 160, armY: 648, side: 238, hem: [234, 1082] },
};

const SHORTS = {
  shorts: { waistTop: 300, waistW: 224, bandH: 72, hip: [252, 460], hemOut: [278, 800], hemIn: [36, 832], crotch: 612 },
  "short-shorts": { waistTop: 330, waistW: 214, bandH: 86, hip: [244, 470], hemOut: [272, 662], hemIn: [34, 684], crotch: 582 },
};

function topOutline(p, back) {
  const drop = (back ? p.backDrop : p.neckDrop) / 0.75;
  const midX = (p.neckW + p.shX) / 2;
  const midY = (p.neckY + p.shY) / 2 - 7;
  const [ux, uy] = p.under;
  const [hx, hy] = p.hem;
  let d = `M${L(p.neckW)} ${p.neckY} C${L(p.neckW - 12)} ${f(p.neckY + drop)} ${R(p.neckW - 12)} ${f(p.neckY + drop)} ${R(p.neckW)} ${p.neckY}`;
  d += ` Q${R(midX)} ${midY} ${R(p.shX)} ${p.shY}`;
  if (p.long) {
    d += ` C${R(p.shX + 70)} ${p.shY + 200} ${R(p.cuffOut[0] - 10)} ${p.cuffOut[1] - 300} ${R(p.cuffOut[0])} ${p.cuffOut[1]}`;
    d += ` L${R(p.cuffIn[0])} ${p.cuffIn[1]}`;
    d += ` C${R(p.cuffIn[0] - 8)} ${p.cuffIn[1] - 260} ${R(ux + 30)} ${uy + 140} ${R(ux)} ${uy}`;
  } else {
    d += ` Q${R((p.shX + p.sOut[0]) / 2 + 14)} ${(p.shY + p.sOut[1]) / 2 - 4} ${R(p.sOut[0])} ${p.sOut[1]}`;
    d += ` L${R(p.sIn[0])} ${p.sIn[1]} L${R(ux)} ${uy}`;
  }
  d += ` C${R(ux - p.taper)} ${uy + 180} ${R(hx)} ${hy - 260} ${R(hx)} ${hy}`;
  d += ` Q${CX} ${hy + 16} ${L(hx)} ${hy}`;
  d += ` C${L(hx)} ${hy - 260} ${L(ux - p.taper)} ${uy + 180} ${L(ux)} ${uy}`;
  if (p.long) {
    d += ` C${L(ux + 30)} ${uy + 140} ${L(p.cuffIn[0] - 8)} ${p.cuffIn[1] - 260} ${L(p.cuffIn[0])} ${p.cuffIn[1]}`;
    d += ` L${L(p.cuffOut[0])} ${p.cuffOut[1]}`;
    d += ` C${L(p.cuffOut[0] - 10)} ${p.cuffOut[1] - 300} ${L(p.shX + 70)} ${p.shY + 200} ${L(p.shX)} ${p.shY}`;
  } else {
    d += ` L${L(p.sIn[0])} ${p.sIn[1]} L${L(p.sOut[0])} ${p.sOut[1]}`;
    d += ` Q${L((p.shX + p.sOut[0]) / 2 + 14)} ${(p.shY + p.sOut[1]) / 2 - 4} ${L(p.shX)} ${p.shY}`;
  }
  d += ` Q${L(midX)} ${midY} ${L(p.neckW)} ${p.neckY} Z`;
  return d;
}

function tankOutline(p, back) {
  const drop = (back ? p.backDrop : p.neckDrop) / 0.75;
  const [hx, hy] = p.hem;
  let d = `M${L(p.neckW)} ${p.topY} C${L(p.neckW - 8)} ${f(p.topY + drop)} ${R(p.neckW - 8)} ${f(p.topY + drop)} ${R(p.neckW)} ${p.topY}`;
  d += ` L${R(p.strapOut)} ${p.topY + 4}`;
  d += ` C${R(p.strapOut + 2)} ${p.armY - 190} ${R(p.side - 70)} ${p.armY - 10} ${R(p.side)} ${p.armY}`;
  d += ` C${R(p.side + 2)} ${p.armY + 200} ${R(hx)} ${hy - 240} ${R(hx)} ${hy}`;
  d += ` Q${CX} ${hy + 16} ${L(hx)} ${hy}`;
  d += ` C${L(hx)} ${hy - 240} ${L(p.side + 2)} ${p.armY + 200} ${L(p.side)} ${p.armY}`;
  d += ` C${L(p.side - 70)} ${p.armY - 10} ${L(p.strapOut + 2)} ${p.armY - 190} ${L(p.strapOut)} ${p.topY + 4} Z`;
  return d;
}

function braOutline(back) {
  if (back) {
    return `M${L(232)} 650 L${L(232)} 548 C${L(215)} 505 ${L(120)} 488 ${L(62)} 470 L${L(158)} 298 L${L(114)} 292 C${L(90)} 360 ${L(30)} 420 ${CX} 432 C${R(30)} 420 ${R(90)} 360 ${R(114)} 292 L${R(158)} 298 L${R(62)} 470 C${R(120)} 488 ${R(215)} 505 ${R(232)} 548 L${R(232)} 650 Q${CX} 662 ${L(232)} 650 Z`;
  }
  return `M${L(232)} 650 L${L(232)} 548 C${L(232)} 450 ${L(190)} 372 ${L(160)} 300 L${L(112)} 292 C${L(108)} 372 ${L(60)} 430 ${CX} 450 C${R(60)} 430 ${R(108)} 372 ${R(112)} 292 L${R(160)} 300 C${R(190)} 372 ${R(232)} 450 ${R(232)} 548 L${R(232)} 650 Q${CX} 662 ${L(232)} 650 Z`;
}

function shortsOutline(p) {
  const { waistTop: wt, waistW: ww, bandH: bh, hip, hemOut: ho, hemIn: hi, crotch: c } = p;
  return `M${L(ww)} ${wt} L${R(ww)} ${wt} L${R(ww + 6)} ${wt + bh} C${R(hip[0])} ${hip[1]} ${R(ho[0] - 6)} ${ho[1] - 120} ${R(ho[0])} ${ho[1]} L${R(hi[0])} ${hi[1]} C${R(hi[0] - 8)} ${hi[1] - 110} ${R(12)} ${c + 40} ${CX} ${c} C${L(12)} ${c + 40} ${L(hi[0] - 8)} ${hi[1] - 110} ${L(hi[0])} ${hi[1]} L${L(ho[0])} ${ho[1]} C${L(ho[0] - 6)} ${ho[1] - 120} ${L(hip[0])} ${hip[1]} ${L(ww + 6)} ${wt + bh} Z`;
}

const JOGGER_D = `M${L(214)} 150 L${R(214)} 150 L${R(221)} 214 C${R(258)} 330 ${R(252)} 720 ${R(172)} 1080 L${R(166)} 1150 L${R(52)} 1150 L${R(56)} 1080 C${R(46)} 820 ${R(30)} 620 ${CX} 505 C${L(30)} 620 ${L(46)} 820 ${L(56)} 1080 L${L(52)} 1150 L${L(166)} 1150 L${L(172)} 1080 C${L(252)} 720 ${L(258)} 330 ${L(221)} 214 Z`;

const LEGGING_D = `M${L(188)} 140 L${R(188)} 140 L${R(196)} 258 C${R(236)} 380 ${R(226)} 700 ${R(112)} 1150 L${R(44)} 1150 C${R(40)} 860 ${R(28)} 640 ${CX} 540 C${L(28)} 640 ${L(40)} 860 ${L(44)} 1150 L${L(112)} 1150 C${L(226)} 700 ${L(236)} 380 ${L(196)} 258 Z`;

/** Bounding box of each garment (design space) for framing. */
export function garmentBox(type) {
  if (TOPS[type]) {
    const p = TOPS[type];
    const w = p.long ? p.cuffOut[0] : p.sOut[0];
    return { x0: L(w), x1: R(w), y0: p.neckY - 10, y1: p.hem[1] + 16 };
  }
  if (TANKS[type]) {
    const p = TANKS[type];
    return { x0: L(p.side + 10), x1: R(p.side + 10), y0: p.topY, y1: p.hem[1] + 16 };
  }
  if (type === "bra") return { x0: L(232), x1: R(232), y0: 290, y1: 662 };
  if (SHORTS[type]) {
    const p = SHORTS[type];
    return { x0: L(p.hemOut[0]), x1: R(p.hemOut[0]), y0: p.waistTop, y1: p.hemIn[1] };
  }
  if (type === "jogger") return { x0: L(258), x1: R(258), y0: 150, y1: 1150 };
  if (type === "legging") return { x0: L(236), x1: R(236), y0: 140, y1: 1150 };
  throw new Error(`Unknown garment ${type}`);
}

export const isBottom = (type) =>
  type === "shorts" || type === "short-shorts" || type === "jogger" || type === "legging";

/** Anchor points used to dress a form/hanger. */
export function garmentAnchors(type) {
  if (TOPS[type]) return { neckY: TOPS[type].neckY, hemY: TOPS[type].hem[1], shX: TOPS[type].shX, hemX: TOPS[type].hem[0] };
  if (TANKS[type]) return { neckY: TANKS[type].topY, hemY: TANKS[type].hem[1], shX: TANKS[type].strapOut + 20, hemX: TANKS[type].hem[0] };
  if (type === "bra") return { neckY: 292, hemY: 656, shX: 160, hemX: 232 };
  if (SHORTS[type]) return { waistY: SHORTS[type].waistTop, waistW: SHORTS[type].waistW, hemY: SHORTS[type].hemIn[1], crotch: SHORTS[type].crotch };
  if (type === "jogger") return { waistY: 150, waistW: 214, hemY: 1150, crotch: 505 };
  if (type === "legging") return { waistY: 140, waistW: 188, hemY: 1150, crotch: 540 };
  return {};
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

const dash = (d, colour, o = 0.45, w = 2.2) =>
  `<path d="${d}" fill="none" stroke="${colour}" stroke-opacity="${o}" stroke-width="${w}" stroke-dasharray="7 5" stroke-linecap="round"/>`;
const line = (d, colour, o = 0.5, w = 2) =>
  `<path d="${d}" fill="none" stroke="${colour}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round"/>`;
const fold = (d, w, o, colour = "#000") =>
  `<path d="${d}" fill="none" stroke="${colour}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round" filter="url(#blur-fold)"/>`;

function logo(x, y, size, colour, anchor = "middle", opacity = 0.85) {
  return `<text x="${x}" y="${y}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${size}" letter-spacing="${size * 0.14}" text-anchor="${anchor}" fill="${colour}" fill-opacity="${opacity}">BRO&#8217;S</text>`;
}

function topDetails(type, p, c, back) {
  const { seam, rib, ink, dark, light } = c;
  let s = "";
  const [ux, uy] = p.under;
  const [hx, hy] = p.hem;
  // Folds
  s += fold(`M${R(ux - 6)} ${uy + 26} Q${R(120)} ${uy + 110} ${R(30)} ${uy + 210}`, 26, 0.22);
  s += fold(`M${L(ux - 6)} ${uy + 26} Q${L(120)} ${uy + 110} ${L(30)} ${uy + 210}`, 26, 0.18);
  s += fold(`M${L(70)} ${hy - 330} Q${L(52)} ${hy - 160} ${L(84)} ${hy - 8}`, 34, 0.16);
  s += fold(`M${R(110)} ${hy - 260} Q${R(128)} ${hy - 120} ${R(100)} ${hy - 6}`, 30, 0.14);
  s += fold(`M${L(150)} ${uy + 40} Q${L(172)} ${uy + 300} ${L(138)} ${hy - 40}`, 60, 0.07, "#fff");
  s += fold(`M${R(40)} ${p.neckY + 120} Q${R(70)} ${uy + 150} ${R(50)} ${hy - 120}`, 70, 0.05, "#fff");
  // Armhole seam
  s += dash(`M${R(p.shX - 4)} ${p.shY + 2} Q${R(p.shX - 24)} ${(p.shY + uy) / 2 + 10} ${R(ux + 2)} ${uy - 2}`, seam);
  s += dash(`M${L(p.shX - 4)} ${p.shY + 2} Q${L(p.shX - 24)} ${(p.shY + uy) / 2 + 10} ${L(ux + 2)} ${uy - 2}`, seam);
  // Shoulder seam
  s += line(`M${R(p.neckW + 4)} ${p.neckY + 4} Q${R((p.neckW + p.shX) / 2)} ${(p.neckY + p.shY) / 2 - 3} ${R(p.shX - 6)} ${p.shY + 2}`, dark, 0.35, 2);
  s += line(`M${L(p.neckW + 4)} ${p.neckY + 4} Q${L((p.neckW + p.shX) / 2)} ${(p.neckY + p.shY) / 2 - 3} ${L(p.shX - 6)} ${p.shY + 2}`, dark, 0.35, 2);
  // Sleeve hems / cuffs
  if (p.long) {
    for (const side of [R, L]) {
      s += line(`M${side(p.cuffOut[0] - 8)} ${p.cuffOut[1] - 62} L${side(p.cuffIn[0] - 4)} ${p.cuffIn[1] - 62}`, dark, 0.4, 2.4);
      s += fold(`M${side(p.shX + 40)} ${p.shY + 180} Q${side(p.shX + 80)} ${p.shY + 420} ${side(p.cuffIn[0] + 20)} ${p.cuffIn[1] - 120}`, 22, 0.16);
    }
  } else {
    for (const side of [R, L]) {
      const [ox, oy] = p.sOut;
      const [ix, iy] = p.sIn;
      const vx = (p.shX - ox) * 0.09;
      const vy = (p.shY - oy) * 0.09;
      s += dash(`M${side(ox + vx)} ${oy + vy} L${side(ix + vx * 0.8)} ${iy + vy}`, seam);
      s += fold(`M${side(p.shX + 20)} ${p.shY + 40} Q${side((p.shX + ix) / 2 + 20)} ${(p.shY + iy) / 2 + 20} ${side(ix + 10)} ${iy - 16}`, 18, 0.16);
    }
  }
  // Hem stitch
  s += dash(`M${L(hx - 6)} ${hy - 24} Q${CX} ${hy - 8} ${R(hx - 6)} ${hy - 24}`, seam);
  // Neck rib
  const drop = (back ? p.backDrop : p.neckDrop) / 0.75;
  s += `<path d="M${L(p.neckW)} ${p.neckY} C${L(p.neckW - 12)} ${f(p.neckY + drop)} ${R(p.neckW - 12)} ${f(p.neckY + drop)} ${R(p.neckW)} ${p.neckY}" fill="none" stroke="${rib}" stroke-width="${type === "oversized" ? 30 : 22}"/>`;
  s += dash(`M${L(p.neckW + 10)} ${p.neckY + 6} C${L(p.neckW - 6)} ${f(p.neckY + drop + 18)} ${R(p.neckW - 6)} ${f(p.neckY + drop + 18)} ${R(p.neckW + 10)} ${p.neckY + 6}`, seam, 0.35, 1.8);
  // Wordmark
  if (back) {
    s += logo(CX, p.neckY + 92, 26, ink);
    s += `<text x="${CX}" y="${p.neckY + 124}" font-family="Arial, sans-serif" font-weight="700" font-size="13" letter-spacing="5" text-anchor="middle" fill="${ink}" fill-opacity="0.6">DROP 001</text>`;
  } else {
    s += logo(R(type === "oversized" ? 70 : 56), p.neckY + (type === "oversized" ? 190 : 165), type === "oversized" ? 28 : 22, ink, "start");
  }
  void light;
  return s;
}

function tankDetails(p, c, back) {
  const { seam, rib, ink, dark } = c;
  const [hx, hy] = p.hem;
  let s = "";
  s += fold(`M${R(p.side - 10)} ${p.armY + 30} Q${R(110)} ${p.armY + 140} ${R(40)} ${p.armY + 260}`, 26, 0.2);
  s += fold(`M${L(p.side - 10)} ${p.armY + 30} Q${L(110)} ${p.armY + 140} ${L(40)} ${p.armY + 260}`, 26, 0.16);
  s += fold(`M${L(80)} ${hy - 320} Q${L(60)} ${hy - 160} ${L(90)} ${hy - 8}`, 34, 0.15);
  s += fold(`M${L(140)} ${p.armY + 40} Q${L(160)} ${p.armY + 250} ${L(130)} ${hy - 40}`, 60, 0.07, "#fff");
  const drop = (back ? p.backDrop : p.neckDrop) / 0.75;
  s += `<path d="M${L(p.neckW)} ${p.topY} C${L(p.neckW - 8)} ${f(p.topY + drop)} ${R(p.neckW - 8)} ${f(p.topY + drop)} ${R(p.neckW)} ${p.topY}" fill="none" stroke="${rib}" stroke-width="18"/>`;
  for (const side of [R, L]) {
    s += `<path d="M${side(p.strapOut)} ${p.topY + 4} C${side(p.strapOut + 2)} ${p.armY - 190} ${side(p.side - 70)} ${p.armY - 10} ${side(p.side)} ${p.armY}" fill="none" stroke="${rib}" stroke-width="18"/>`;
    s += dash(`M${side(p.strapOut - 14)} ${p.topY + 10} C${side(p.strapOut - 12)} ${p.armY - 180} ${side(p.side - 84)} ${p.armY + 6} ${side(p.side - 6)} ${p.armY + 16}`, seam, 0.4, 1.8);
  }
  s += dash(`M${L(hx - 6)} ${hy - 24} Q${CX} ${hy - 8} ${R(hx - 6)} ${hy - 24}`, seam);
  s += back
    ? logo(CX, p.topY + drop * 0.75 + 70, 24, ink)
    : logo(R(40), p.armY - 10, 22, ink, "start");
  void dark;
  return s;
}

function braDetails(c, back) {
  const { seam, rib, ink } = c;
  let s = "";
  s += `<path d="M${L(232)} 584 Q${CX} 596 ${R(232)} 584 L${R(232)} 650 Q${CX} 662 ${L(232)} 650 Z" fill="#000" fill-opacity="0.12"/>`;
  s += dash(`M${L(228)} 592 Q${CX} 604 ${R(228)} 592`, seam);
  s += dash(`M${L(228)} 640 Q${CX} 652 ${R(228)} 640`, seam);
  s += fold(`M${L(150)} 380 Q${L(90)} 460 ${L(40)} 500`, 30, 0.16);
  s += fold(`M${R(150)} 380 Q${R(90)} 460 ${R(40)} 500`, 30, 0.2);
  s += fold(`M${L(170)} 420 Q${L(180)} 500 ${L(150)} 560`, 50, 0.08, "#fff");
  if (back) {
    s += `<path d="M${L(114)} 292 C${L(90)} 360 ${L(30)} 420 ${CX} 432 C${R(30)} 420 ${R(90)} 360 ${R(114)} 292" fill="none" stroke="${rib}" stroke-width="14"/>`;
  } else {
    s += `<path d="M${L(112)} 292 C${L(108)} 372 ${L(60)} 430 ${CX} 450 C${R(60)} 430 ${R(108)} 372 ${R(112)} 292" fill="none" stroke="${rib}" stroke-width="14"/>`;
  }
  s += logo(CX, 630, 22, ink);
  return s;
}

function shortsDetails(p, c, back) {
  const { seam, rib, ink, dark } = c;
  const { waistTop: wt, waistW: ww, bandH: bh, hemOut: ho, hemIn: hi, crotch } = p;
  let s = "";
  s += `<rect x="${L(ww + 10)}" y="${wt}" width="${(ww + 10) * 2}" height="${bh}" fill="${rib}" fill-opacity="0.55"/>`;
  s += line(`M${L(ww + 6)} ${wt + bh} L${R(ww + 6)} ${wt + bh}`, dark, 0.5, 2.4);
  s += dash(`M${L(ww + 4)} ${wt + bh - 10} L${R(ww + 4)} ${wt + bh - 10}`, seam, 0.35, 1.8);
  s += fold(`M${L(60)} ${wt + bh + 20} Q${L(30)} ${crotch - 60} ${L(12)} ${crotch - 6}`, 22, 0.2);
  s += fold(`M${R(60)} ${wt + bh + 20} Q${R(30)} ${crotch - 60} ${R(12)} ${crotch - 6}`, 22, 0.22);
  s += fold(`M${L(150)} ${wt + bh + 60} Q${L(170)} ${ho[1] - 160} ${L(150)} ${ho[1] - 20}`, 60, 0.07, "#fff");
  s += fold(`M${R(120)} ${crotch + 20} Q${R(140)} ${ho[1] - 80} ${R(110)} ${ho[1] + 4}`, 30, 0.16);
  if (!back) s += line(`M${CX} ${wt + bh + 4} Q${CX + 6} ${(wt + bh + crotch) / 2} ${CX} ${crotch - 4}`, dark, 0.35, 2);
  for (const side of [R, L]) {
    const vx = 0;
    s += dash(`M${side(ho[0] - 8)} ${ho[1] - 22} L${side(hi[0] + 6)} ${hi[1] - 22 + vx}`, seam);
    s += line(`M${side(ho[0] - 2)} ${ho[1] - 2} L${side(ho[0] - 12)} ${ho[1] - 64}`, dark, 0.45, 2.2);
  }
  if (!back) {
    // Drawcord
    const cord = shade(rib, isLight(rib) ? -0.25 : 0.35);
    s += `<circle cx="${CX - 16}" cy="${wt + bh / 2}" r="5" fill="${dark}" fill-opacity="0.7"/><circle cx="${CX + 16}" cy="${wt + bh / 2}" r="5" fill="${dark}" fill-opacity="0.7"/>`;
    s += `<path d="M${CX - 16} ${wt + bh / 2} C${CX - 22} ${wt + bh + 40} ${CX - 40} ${wt + bh + 90} ${CX - 30} ${wt + bh + 150}" fill="none" stroke="${cord}" stroke-width="7" stroke-linecap="round"/>`;
    s += `<path d="M${CX + 16} ${wt + bh / 2} C${CX + 20} ${wt + bh + 50} ${CX + 12} ${wt + bh + 110} ${CX + 26} ${wt + bh + 170}" fill="none" stroke="${cord}" stroke-width="7" stroke-linecap="round"/>`;
    s += logo(L(ho[0] - 62), ho[1] - 56, 20, ink, "start");
  } else {
    s += dash(`M${R(40)} ${wt + bh + 70} L${R(170)} ${wt + bh + 64}`, seam, 0.5, 2);
    s += line(`M${R(46)} ${wt + bh + 76} L${R(164)} ${wt + bh + 70}`, dark, 0.45, 3);
    s += logo(CX, wt + bh / 2 + 9, 22, ink);
  }
  return s;
}

function joggerDetails(c, back) {
  const { seam, rib, ink, dark } = c;
  let s = "";
  s += `<rect x="${L(230)}" y="150" width="460" height="64" fill="${rib}" fill-opacity="0.55"/>`;
  s += line(`M${L(221)} 214 L${R(221)} 214`, dark, 0.5, 2.4);
  for (const side of [R, L]) {
    s += `<rect x="${side === R ? R(52) : L(174)}" y="1080" width="122" height="70" fill="${rib}" fill-opacity="0.5"/>`;
    s += line(`M${side(56)} 1080 L${side(172)} 1080`, dark, 0.5, 2.4);
    for (let i = 0; i < 10; i++) {
      const x = 62 + i * 11;
      s += line(`M${side(x)} 1086 L${side(x - 1)} 1146`, dark, 0.14, 2);
    }
    s += fold(`M${side(70)} 780 Q${side(150)} 800 ${side(210)} 770`, 22, 0.2);
    s += fold(`M${side(64)} 860 Q${side(130)} 880 ${side(190)} 850`, 18, 0.16);
    s += fold(`M${side(60)} 990 Q${side(120)} 1010 ${side(176)} 985`, 18, 0.18);
    s += fold(`M${side(140)} 300 Q${side(160)} 600 ${side(130)} 1000`, 60, 0.07, "#fff");
    s += dash(`M${side(104)} 240 C${side(104)} 500 ${side(108)} 800 ${side(112)} 1076`, seam, 0.18, 1.6);
    if (!back) s += dash(`M${side(186)} 216 Q${side(212)} 300 ${side(248)} 374`, seam, 0.55, 2.2);
  }
  s += fold(`M${L(40)} 230 Q${L(20)} 400 ${CX} 500`, 22, 0.18);
  s += fold(`M${R(40)} 230 Q${R(20)} 400 ${CX} 500`, 22, 0.2);
  for (let i = 0; i < 38; i++) s += line(`M${L(214) + i * 11.5 + 6} 156 L${L(214) + i * 11.5 + 5} 208`, dark, 0.1, 2);
  if (!back) {
    const cord = shade(rib, isLight(rib) ? -0.25 : 0.35);
    s += `<path d="M${CX - 14} 190 C${CX - 20} 250 ${CX - 34} 300 ${CX - 26} 360" fill="none" stroke="${cord}" stroke-width="10" stroke-linecap="round"/>`;
    s += `<path d="M${CX + 14} 190 C${CX + 18} 260 ${CX + 10} 320 ${CX + 24} 380" fill="none" stroke="${cord}" stroke-width="10" stroke-linecap="round"/>`;
    s += logo(L(210), 330, 20, ink, "start");
  } else {
    s += line(`M${R(60)} 300 L${R(180)} 294`, dark, 0.5, 3);
    s += logo(CX, 192, 22, ink);
  }
  return s;
}

function leggingDetails(c, back) {
  const { seam, rib, ink, dark } = c;
  let s = "";
  s += `<path d="M${L(188)} 140 L${R(188)} 140 L${R(196)} 258 Q${CX} ${back ? 250 : 292} ${L(196)} 258 Z" fill="${rib}" fill-opacity="0.35"/>`;
  s += dash(`M${L(194)} 250 Q${CX} ${back ? 242 : 284} ${R(194)} 250`, seam, 0.5, 2);
  for (const side of [R, L]) {
    s += dash(`M${side(206)} 300 C${side(196)} 600 ${side(150)} 900 ${side(96)} 1146`, seam, 0.4, 1.8);
    s += fold(`M${side(60)} 800 Q${side(110)} 815 ${side(170)} 790`, 16, 0.16);
    s += fold(`M${side(150)} 330 Q${side(170)} 620 ${side(120)} 1000`, 50, 0.08, "#fff");
    s += fold(`M${side(52)} 1060 Q${side(80)} 1070 ${side(110)} 1058`, 14, 0.16);
  }
  s += `<path d="M${CX} 540 L${CX - 24} 590 L${CX} 640 L${CX + 24} 590 Z" fill="#000" fill-opacity="0.1"/>`;
  s += fold(`M${L(60)} 300 Q${L(20)} 460 ${CX} 540`, 20, 0.16);
  s += fold(`M${R(60)} 300 Q${R(20)} 460 ${CX} 540`, 20, 0.18);
  s += back ? logo(CX, 208, 22, ink) : logo(L(170), 380, 18, ink, "start");
  return s;
}

/**
 * Returns an SVG fragment of the garment in design space.
 * @param {string} type GarmentType
 * @param {string} hex fabric colour
 * @param {{ id: string, back?: boolean, light?: number }} opts
 */
export function garmentSVG(type, hex, { id, back = false, light = 1 }) {
  const lightFabric = isLight(hex);
  const c = {
    base: hex,
    dark: shade(hex, -0.55),
    light: shade(hex, 0.3),
    seam: lightFabric ? shade(hex, -0.45) : shade(hex, 0.32),
    rib: lightFabric ? shade(hex, -0.06) : shade(hex, 0.05),
    ink: lightFabric ? "#1d1d1d" : "#dedad2",
    inner: shade(hex, lightFabric ? -0.22 : -0.35),
  };

  let outline;
  let details = "";
  let inner = "";
  if (TOPS[type]) {
    const p = TOPS[type];
    outline = topOutline(p, back);
    details = topDetails(type, p, c, back);
    if (!back) {
      const drop = p.neckDrop / 0.75;
      const bd = p.backDrop / 0.75;
      inner = `<path d="M${L(p.neckW)} ${p.neckY} C${L(p.neckW - 12)} ${f(p.neckY + bd)} ${R(p.neckW - 12)} ${f(p.neckY + bd)} ${R(p.neckW)} ${p.neckY} C${R(p.neckW - 12)} ${f(p.neckY + drop)} ${L(p.neckW - 12)} ${f(p.neckY + drop)} ${L(p.neckW)} ${p.neckY} Z" fill="${c.inner}"/>`;
      inner += `<path d="M${L(p.neckW)} ${p.neckY} C${L(p.neckW - 12)} ${f(p.neckY + bd)} ${R(p.neckW - 12)} ${f(p.neckY + bd)} ${R(p.neckW)} ${p.neckY}" fill="none" stroke="${c.rib}" stroke-width="10"/>`;
    }
  } else if (TANKS[type]) {
    const p = TANKS[type];
    outline = tankOutline(p, back);
    details = tankDetails(p, c, back);
  } else if (type === "bra") {
    outline = braOutline(back);
    details = braDetails(c, back);
  } else if (SHORTS[type]) {
    outline = shortsOutline(SHORTS[type]);
    details = shortsDetails(SHORTS[type], c, back);
  } else if (type === "jogger") {
    outline = JOGGER_D;
    details = joggerDetails(c, back);
  } else if (type === "legging") {
    outline = LEGGING_D;
    details = leggingDetails(c, back);
  }

  const shadowOpacity = 0.3 * light;
  return `
  <defs>
    <clipPath id="clip-${id}"><path d="${outline}"/></clipPath>
    <linearGradient id="lit-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="${lightFabric ? 0.22 : 0.14}"/>
      <stop offset="0.45" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="${lightFabric ? 0.22 : 0.4}"/>
    </linearGradient>
    <radialGradient id="glow-${id}" cx="0.38" cy="0.3" r="0.55">
      <stop offset="0" stop-color="#fff" stop-opacity="${lightFabric ? 0.16 : 0.1}"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <path d="${outline}" fill="#000" fill-opacity="${shadowOpacity}" transform="translate(10 26)" filter="url(#blur-shadow)"/>
  ${inner}
  <path d="${outline}" fill="${c.base}"/>
  <g clip-path="url(#clip-${id})">
    ${details}
    <rect x="0" y="0" width="1000" height="1250" fill="url(#lit-${id})"/>
    <rect x="0" y="0" width="1000" height="1250" fill="url(#glow-${id})"/>
    <rect x="0" y="0" width="1000" height="1250" filter="url(#fabric-noise)" opacity="${lightFabric ? 0.1 : 0.14}"/>
  </g>
  <path d="${outline}" fill="none" stroke="${c.dark}" stroke-opacity="0.55" stroke-width="2"/>`;
}

/** Shared filter defs every scene containing garments must include once. */
export const garmentFilters = `
  <filter id="blur-fold" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1400" height="1650"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="blur-shadow" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1400" height="1650"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="fabric-noise" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4"/>
    <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 -0.28"/>
  </filter>`;
