import type { Category } from "@/types";
import { media } from "./media";

/** Homepage category panels. `slug` matches the shop's ?category filter. */
export const categories: Category[] = [
  { slug: "men", title: "Men", eyebrow: "01 / Training", href: "/shop?category=men", image: media.categoryMen.src, imageAlt: media.categoryMen.alt },
  { slug: "women", title: "Women", eyebrow: "02 / Training", href: "/shop?category=women", image: media.categoryWomen.src, imageAlt: media.categoryWomen.alt },
  { slug: "tees", title: "Tees", eyebrow: "03 / Tops", href: "/shop?category=tees", image: media.categoryTees.src, imageAlt: media.categoryTees.alt },
  { slug: "shorts", title: "Shorts", eyebrow: "04 / Bottoms", href: "/shop?category=shorts", image: media.categoryShorts.src, imageAlt: media.categoryShorts.alt },
  { slug: "joggers", title: "Joggers", eyebrow: "05 / Bottoms", href: "/shop?category=joggers", image: media.categoryJoggers.src, imageAlt: media.categoryJoggers.alt },
  { slug: "new-drop", title: "New Drop", eyebrow: "06 / Drop 001", href: "/shop?collection=drop-001", image: media.categoryNewDrop.src, imageAlt: media.categoryNewDrop.alt },
];

/** Filter options on /shop. Gender slugs and product categories share one list. */
export const shopCategories: { slug: string; label: string }[] = [
  { slug: "all", label: "All" },
  { slug: "men", label: "Men" },
  { slug: "women", label: "Women" },
  { slug: "tees", label: "Tees" },
  { slug: "tanks", label: "Tanks" },
  { slug: "long-sleeves", label: "Long Sleeves" },
  { slug: "shorts", label: "Shorts" },
  { slug: "joggers", label: "Joggers" },
  { slug: "leggings", label: "Leggings" },
  { slug: "bras", label: "Sports Bras" },
];
