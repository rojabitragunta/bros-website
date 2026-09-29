/**
 * BRO'S LAB — sample specification data.
 * Values describe the demo Performance Tee and are illustrative only.
 */

export const labSpecs = [
  { value: "170", unit: "GSM", label: "Fabric weight", note: "Light enough to breathe, dense enough to hold shape." },
  { value: "88%", unit: "Polyester", label: "Base yarn", note: "Smooth-face filament for a clean, fast-drying hand." },
  { value: "12%", unit: "Elastane", label: "Stretch yarn", note: "Recovery that follows the rep and returns." },
  { value: "4-Way", unit: "Stretch", label: "Mobility", note: "Stretch across both warp and weft directions." },
  { value: "Wicking", unit: "Finish", label: "Moisture", note: "Moves sweat to the surface to spread and evaporate." },
  { value: "Quick", unit: "Dry", label: "Dry time", note: "Lower absorbency than cotton jersey of the same weight." },
];

export const techPillars = [
  {
    id: "fabric",
    index: "01",
    title: "Fabric",
    lead: "Every garment starts with the knit.",
    body: "We choose knits by how they behave in motion — the way they drape at rest, stretch under load and recover after. Smooth interlocks for training tops, dense matte knits for leggings, brushed terry for recovery.",
  },
  {
    id: "gsm",
    index: "02",
    title: "GSM",
    lead: "Weight is a design decision.",
    body: "Grams per square metre tells you how substantial a fabric is. Lighter weights run cooler; heavier weights hold structure. Each piece in Drop 001 is weighted for its job.",
  },
  {
    id: "stretch",
    index: "03",
    title: "Stretch",
    lead: "Four directions. Full range.",
    body: "Elastane blends give fabric the ability to stretch and recover. 4-way stretch moves both lengthwise and crosswise, so squats, presses and sprints stay unrestricted.",
  },
  {
    id: "breathability",
    index: "04",
    title: "Breathability",
    lead: "Air in. Heat out.",
    body: "Open knit structures and micro-mesh panels let air pass through the fabric, helping you stay comfortable through long sessions in Hyderabad heat.",
  },
  {
    id: "moisture",
    index: "05",
    title: "Moisture",
    lead: "Wick, spread, dry.",
    body: "Synthetic yarns absorb very little water. Paired with a wicking finish, sweat is drawn along the fibres and spread across the surface, where it can evaporate faster.",
  },
  {
    id: "construction",
    index: "06",
    title: "Construction",
    lead: "Seams that stay out of the way.",
    body: "Flatlock seams lie flat against the skin to reduce rubbing. Bonded necklines and taped shoulders keep their shape wash after wash.",
  },
  {
    id: "fit",
    index: "07",
    title: "Fit",
    lead: "Cut for the athlete, not the hanger.",
    body: "Athletic fits follow the shoulders and taper at the waist. Oversized fits drop the shoulder for a relaxed, boxy line. Every product page tells you which is which.",
  },
  {
    id: "care",
    index: "08",
    title: "Care",
    lead: "Treat it right. It lasts.",
    body: "Wash cold and inside out, skip the tumble dryer, and keep fabric softener away from performance knits — softeners coat the fibres and slow down wicking.",
  },
];

export const gsmScale = [
  { gsm: 120, name: "Studio Short", use: "Feather-light woven" },
  { gsm: 150, name: "Performance Tank", use: "Ventilated micro-mesh" },
  { gsm: 170, name: "Performance Tee", use: "Training interlock" },
  { gsm: 240, name: "Oversized Tee", use: "Heavyweight jersey" },
  { gsm: 300, name: "Everyday Jogger", use: "Brushed terry" },
];
