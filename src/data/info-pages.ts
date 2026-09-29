/**
 * Help, company and legal pages.
 *
 * DRAFT PLACEHOLDER COPY — these pages describe intended policies for the
 * demo storefront and must be replaced with reviewed legal/policy text
 * before launch.
 */

export interface InfoSection {
  heading: string;
  body: string[];
}

export interface InfoPage {
  slug: string;
  group: "Help" | "Company" | "Legal";
  title: string;
  intro: string;
  sections: InfoSection[];
}

export const infoPages: InfoPage[] = [
  {
    slug: "shipping",
    group: "Help",
    title: "Shipping",
    intro: "Free shipping across India on every Drop 001 order.",
    sections: [
      { heading: "Delivery times", body: ["Metro cities: typically 2–4 working days.", "Rest of India: typically 4–7 working days.", "Delivery times will be confirmed at checkout once shipping is live."] },
      { heading: "Tracking", body: ["Once your order ships, you'll receive a tracking link by email and SMS."] },
      { heading: "Cash on delivery", body: ["COD availability will be shown at checkout for eligible pincodes."] },
    ],
  },
  {
    slug: "returns",
    group: "Help",
    title: "Returns & Exchanges",
    intro: "Wrong size? Changed your mind? We'll make it easy.",
    sections: [
      { heading: "Window", body: ["Request a return or exchange within 7 days of delivery."] },
      { heading: "Condition", body: ["Items must be unworn, unwashed and have original tags attached.", "For hygiene reasons, sports bras and leggings can only be returned unopened."] },
      { heading: "How it works", body: ["Start a return from your account. We'll arrange a pickup from your address."] },
    ],
  },
  {
    slug: "size-guide",
    group: "Help",
    title: "Size Guide",
    intro: "Find your fit. All measurements are body measurements in centimetres.",
    sections: [],
  },
  {
    slug: "faq",
    group: "Help",
    title: "FAQ",
    intro: "Quick answers to common questions.",
    sections: [
      { heading: "When does Drop 001 restock?", body: ["Sizes that sell out will be restocked where possible. Join the list at the bottom of the homepage to hear first."] },
      { heading: "How should I wash performance kit?", body: ["Cold wash, inside out, no fabric softener, and line dry. See the Care section on any product page."] },
      { heading: "Do you ship outside India?", body: ["Not yet. We're launching across India first."] },
      { heading: "How do I pay and track my order?", body: ["Create an account, check out with Cash on Delivery (or online payment where available), and follow your order's status from your account page."] },
      { heading: "Can I cancel an order?", body: ["Yes — until it is packed. Open the order in your account and choose Cancel order."] },
    ],
  },
  {
    slug: "contact",
    group: "Help",
    title: "Contact",
    intro: "Hyderabad-based. Here to help.",
    sections: [
      { heading: "Customer care", body: ["Support channels will be published at launch."] },
      { heading: "Press & collaborations", body: ["Contact details will be published at launch."] },
    ],
  },
  {
    slug: "careers",
    group: "Company",
    title: "Careers",
    intro: "We're building a performance brand from Hyderabad.",
    sections: [
      { heading: "Open roles", body: ["There are no open roles listed right now. Check back after launch."] },
    ],
  },
  {
    slug: "privacy",
    group: "Legal",
    title: "Privacy Policy",
    intro: "Draft placeholder — to be replaced with the reviewed policy before launch.",
    sections: [
      { heading: "What this preview stores", body: ["This frontend preview stores your bag, wishlist and recent searches only in your browser's local storage. Nothing is sent to a server."] },
    ],
  },
  {
    slug: "terms",
    group: "Legal",
    title: "Terms of Service",
    intro: "Draft placeholder — to be replaced with reviewed terms before launch.",
    sections: [
      { heading: "Preview", body: ["Products, prices and specifications shown are sample data for design review."] },
    ],
  },
  {
    slug: "refunds",
    group: "Legal",
    title: "Refund Policy",
    intro: "Draft placeholder — to be replaced with the reviewed policy before launch.",
    sections: [
      { heading: "Refunds", body: ["Approved refunds will be issued to the original payment method once the return is received and inspected."] },
    ],
  },
  {
    slug: "shipping-policy",
    group: "Legal",
    title: "Shipping Policy",
    intro: "Draft placeholder — to be replaced with the reviewed policy before launch.",
    sections: [
      { heading: "Coverage", body: ["We intend to ship to serviceable pincodes across India."] },
    ],
  },
];
