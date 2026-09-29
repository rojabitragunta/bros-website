/**
 * Global site configuration — edit copy here, not in components.
 */

export const site = {
  name: "BRO'S",
  title: "BRO'S — Premium Performance Activewear",
  description:
    "BRO'S is a Hyderabad-born performance activewear label. Drop 001: training tees, shorts, joggers and more — engineered for movement.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  locale: "en_IN",
  city: "Hyderabad",
  currency: "INR",
  freeShippingThreshold: 0,
  /** Placeholder social URLs — replace with official handles before launch. */
  social: {
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
  },
};

/** Announcement bar — rotates through messages on small screens. */
export const announcement = {
  enabled: true,
  messages: ["FREE SHIPPING ACROSS INDIA", "DROP 001 NOW LIVE"],
  href: "/shop?collection=drop-001",
};

export const marqueeWords = ["BRO'S", "PERFORMANCE", "MOVEMENT", "TRAIN", "REPEAT"];

export interface NavLink {
  label: string;
  href: string;
}

export const primaryNav: NavLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "Men", href: "/shop?category=men" },
  { label: "Women", href: "/shop?category=women" },
  { label: "New Drop", href: "/shop?collection=drop-001" },
  { label: "About", href: "/about" },
];

export const secondaryNav: NavLink[] = [
  { label: "Technology", href: "/technology" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Account", href: "/account" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Men", href: "/shop?category=men" },
      { label: "Women", href: "/shop?category=women" },
      { label: "Tees", href: "/shop?category=tees" },
      { label: "Shorts", href: "/shop?category=shorts" },
      { label: "Joggers", href: "/shop?category=joggers" },
      { label: "New Drop", href: "/shop?collection=drop-001" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shipping", href: "/info/shipping" },
      { label: "Returns", href: "/info/returns" },
      { label: "Size Guide", href: "/info/size-guide" },
      { label: "FAQ", href: "/info/faq" },
      { label: "Contact", href: "/info/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Technology", href: "/technology" },
      { label: "Lookbook", href: "/lookbook" },
      { label: "Careers", href: "/info/careers" },
    ],
  },
];

export const legalNav: NavLink[] = [
  { label: "Privacy", href: "/info/privacy" },
  { label: "Terms", href: "/info/terms" },
  { label: "Refunds", href: "/info/refunds" },
  { label: "Shipping", href: "/info/shipping-policy" },
];

export const popularSearches = ["Performance Tee", "Oversized", "Shorts", "Jogger", "Legging", "Onyx Black"];
