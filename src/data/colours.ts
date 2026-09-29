// Self-contained on purpose (type-only imports): scripts/generate-assets.mjs
// imports this file directly with Node's TypeScript type-stripping.
import type { Colour, ColourId } from "../types/product";

export const colours: Colour[] = [
  { id: "onyx", name: "Onyx Black", hex: "#151515" },
  { id: "graphite", name: "Graphite", hex: "#3c3d40" },
  { id: "bone", name: "Bone", hex: "#e3ddd1" },
  { id: "ash", name: "Ash Grey", hex: "#a3a09a" },
  { id: "moss", name: "Moss", hex: "#4b4f3d" },
  { id: "midnight", name: "Midnight", hex: "#1d2433" },
  { id: "clay", name: "Clay", hex: "#8b6e5a" },
];

export const colourMap = Object.fromEntries(
  colours.map((c) => [c.id, c]),
) as Record<ColourId, Colour>;
