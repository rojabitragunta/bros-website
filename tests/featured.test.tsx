/**
 * Regression: the homepage must render with an empty or small catalogue
 * (production crashed when fewer than five products existed).
 *
 *   npm run test:unit
 */
import assert from "node:assert/strict";
import { describe, mock, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { pickFeatured } from "../src/lib/catalog-utils";
import type { Product } from "../src/types";

function product(n: number, overrides: Partial<Product> = {}): Product {
  const images = [{ src: "/images/placeholder-product.svg", alt: `P${n}`, view: "front" as const, width: 1200, height: 1500, placeholder: true }];
  return {
    id: `p-${n}`,
    slug: `product-${n}`,
    name: `BRO'S Product ${n}`,
    tagline: "Tag",
    price: 1000 + n,
    category: "tees",
    gender: ["men"],
    collections: ["drop-001"],
    colour: "Onyx Black",
    colours: [{ colour: "onyx", images }],
    images,
    sizes: ["M"],
    soldOutSizes: [],
    variants: [{ id: `v-${n}`, colour: "onyx", size: "M", sku: `SKU-${n}`, available: 5, status: "in_stock" }],
    description: "Desc",
    fabric: "Knit",
    gsm: 180,
    composition: [],
    fit: "Athletic fit — close",
    stretch: "4-way",
    features: [],
    care: [],
    badges: [],
    releasedAt: "2026-09-01",
    featuredRank: n,
    ...overrides,
  };
}

// Next's image/link modules need the Next runtime; plain stand-ins are enough to render markup.
mock.module("next/image", {
  defaultExport: ({ src, alt }: { src: string; alt: string }) => createElement("img", { src, alt }),
});
mock.module("next/link", {
  defaultExport: ({ href, children, ...rest }: { href: string; children?: React.ReactNode }) => createElement("a", { href, ...rest }, children),
});
const { FeaturedDrop } = await import("../src/components/home/FeaturedDrop");

const list = (n: number) => Array.from({ length: n }, (_, i) => product(i + 1));

describe("pickFeatured", () => {
  test("empty catalogue returns an empty list", () => {
    assert.deepEqual(pickFeatured([], ["a", "b"], 5), []);
  });
  test("fewer products than slots returns only real products", () => {
    const out = pickFeatured(list(3), ["missing-slug"], 5);
    assert.equal(out.length, 3);
    assert.ok(out.every(Boolean));
  });
  test("preferred slugs come first, then fill by rank, no duplicates", () => {
    const out = pickFeatured(list(8), ["product-7", "product-2"], 5);
    assert.deepEqual(out.map((p) => p.slug), ["product-7", "product-2", "product-1", "product-3", "product-4"]);
  });
});

describe("FeaturedDrop", () => {
  test("renders an empty-catalogue state with zero products", () => {
    const html = renderToStaticMarkup(<FeaturedDrop products={[]} total={0} />);
    assert.match(html, /Pieces landing soon/);
    assert.match(html, /Arriving soon/);
  });
  test("renders a simple grid with fewer than five products", () => {
    const html = renderToStaticMarkup(<FeaturedDrop products={list(3)} total={3} />);
    for (const n of [1, 2, 3]) assert.match(html, new RegExp(`Product ${n}`));
    assert.doesNotMatch(html, /Pieces landing soon/);
  });
  test("renders the editorial layout with five products", () => {
    const html = renderToStaticMarkup(<FeaturedDrop products={list(5)} total={12} />);
    assert.match(html, /Hero piece/);
    assert.match(html, /Gym to street/);
  });
});
