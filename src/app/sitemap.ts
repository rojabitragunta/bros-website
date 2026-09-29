import type { MetadataRoute } from "next";
import { infoPages } from "@/data/info-pages";
import { site } from "@/data/site";
import { getProducts } from "@/lib/services/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const now = new Date();
  const staticRoutes = ["", "/shop", "/about", "/technology", "/lookbook"].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...staticRoutes,
    ...products.map((p) => ({ url: `${site.url}/products/${p.slug}`, lastModified: new Date(p.releasedAt), priority: 0.7 })),
    ...infoPages.map((p) => ({ url: `${site.url}/info/${p.slug}`, lastModified: now, priority: 0.3 })),
  ];
}
