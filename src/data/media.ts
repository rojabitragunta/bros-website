/**
 * Campaign media manifest.
 *
 * Every editorial image on the site is referenced from here. The current
 * files are generated placeholders (see scripts/generate-assets.mjs). To use
 * final photography, drop a file in /public/images/campaign and update the
 * `src` (and dimensions) below — no component changes needed.
 */

export interface MediaAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const img = (name: string, alt: string, width: number, height: number): MediaAsset => ({
  src: `/images/campaign/${name}.webp`,
  alt,
  width,
  height,
});

export const media = {
  heroWide: img("hero-wide", "Drop 001 outfit — oversized tee and jogger on a form in a dark studio", 2400, 1350),
  heroTall: img("hero-tall", "Drop 001 outfit — oversized tee and jogger on a form in a dark studio", 1200, 1800),

  categoryMen: img("category-men", "Men's training long sleeve and jogger on a form", 1200, 1500),
  categoryWomen: img("category-women", "Women's sports bra and legging on a form", 1200, 1500),
  categoryTees: img("category-tees", "A stack of folded BRO'S tees on a concrete plinth", 1200, 1500),
  categoryShorts: img("category-shorts", "Moss training shorts on a clip hanger", 1200, 1500),
  categoryJoggers: img("category-joggers", "Graphite jogger on a clip hanger", 1200, 1500),
  categoryNewDrop: img("category-new-drop", "Bone oversized tee and midnight jogger on a form", 1200, 1500),

  lookTrain: img("lookbook-train", "A loaded barbell racked in a dark gym", 2400, 1350),
  lookTrainTall: img("lookbook-train-tall", "A loaded barbell racked in a dark gym", 1200, 1600),
  lookMove: img("lookbook-move", "Moss fabric rippling in motion", 2400, 1350),
  lookMoveTall: img("lookbook-move-tall", "Moss fabric rippling in motion", 1200, 1600),
  lookLive: img("lookbook-live", "A colonnade of pointed arches at night", 2400, 1350),
  lookLiveTall: img("lookbook-live-tall", "A colonnade of pointed arches at night", 1200, 1600),
  lookRest: img("lookbook-rest", "Folded tees on a bench in slatted window light", 2400, 1350),
  lookGraphite: img("lookbook-graphite", "Graphite fabric in motion", 2400, 1350),
  lookClay: img("lookbook-clay", "Clay fabric in motion", 1200, 1500),
  lookOutfitOnyx: img("lookbook-outfit-onyx", "Onyx performance tee with graphite shorts", 1200, 1500),
  lookOutfitBone: img("lookbook-outfit-bone", "Bone crop tee with onyx legging", 1200, 1500),

  communityTrack: img("community-track", "Running track lanes at night", 1200, 1500),
  communityChalk: img("community-chalk", "Chalk dust suspended in the dark", 1200, 1500),
  communityPlates: img("community-plates", "A stack of bumper plates under a spotlight", 1200, 1500),
  communityRest: img("community-rest", "Folded kit on a bench in window light", 1200, 1500),

  techKnit: img("tech-knit", "Macro view of a performance knit", 2400, 1350),
  techKnitBone: img("tech-knit-bone", "Macro view of a bone jersey knit", 1200, 1500),
  techKnitMoss: img("tech-knit-moss", "Macro view of a moss jersey knit", 1200, 1500),

  aboutArches: img("about-arches", "A colonnade of pointed arches at night", 2400, 1350),

  og: { src: "/images/campaign/og-default.jpg", alt: "BRO'S — Drop 001", width: 1200, height: 630 },
} satisfies Record<string, MediaAsset>;
