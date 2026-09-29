import { media, type MediaAsset } from "./media";

export interface LookbookChapter {
  id: string;
  index: string;
  headline: string;
  kicker: string;
  body: string;
  image: MediaAsset;
  imageTall: MediaAsset;
  /** Product slugs featured in this look. */
  products: string[];
  align: "left" | "right" | "center";
}

export const lookbookChapters: LookbookChapter[] = [
  {
    id: "train-hard",
    index: "01",
    headline: "Train Hard.",
    kicker: "Chapter 01 — The Floor",
    body: "Heavy days, bright lights, chalk in the air. Kit built to disappear under load.",
    image: media.lookTrain,
    imageTall: media.lookTrainTall,
    products: ["bros-performance-tee", "bros-training-shorts"],
    align: "left",
  },
  {
    id: "move-free",
    index: "02",
    headline: "Move Free.",
    kicker: "Chapter 02 — The Stretch",
    body: "Four-way stretch fabric that follows every angle and comes back to shape.",
    image: media.lookMove,
    imageTall: media.lookMoveTall,
    products: ["bros-sculpt-legging", "bros-crop-training-tee"],
    align: "right",
  },
  {
    id: "live-outside",
    index: "03",
    headline: "Live Outside the Gym.",
    kicker: "Chapter 03 — The City",
    body: "Night walks under old arches. Heavyweight cotton and tapered joggers that work anywhere.",
    image: media.lookLive,
    imageTall: media.lookLiveTall,
    products: ["bros-oversized-essential-tee", "bros-everyday-jogger"],
    align: "center",
  },
];

export const lookbookGallery: { image: MediaAsset; caption: string; span: "wide" | "tall" }[] = [
  { image: media.lookOutfitOnyx, caption: "Performance Tee / Onyx — Training Shorts / Graphite", span: "tall" },
  { image: media.lookRest, caption: "Rest day. Oversized Essential Tee, folded.", span: "wide" },
  { image: media.lookOutfitBone, caption: "Crop Training Tee / Bone — Sculpt Legging / Onyx", span: "tall" },
  { image: media.lookGraphite, caption: "Graphite, in motion.", span: "wide" },
  { image: media.lookClay, caption: "Clay colourway — Sculpt Legging", span: "tall" },
  { image: media.communityPlates, caption: "Plates, stacked.", span: "wide" },
];
