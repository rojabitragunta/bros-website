import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ImageManager } from "@/components/admin/ImageManager";
import { ProductForm } from "@/components/admin/ProductForm";
import { VariantTable } from "@/components/admin/VariantTable";
import { Card, PageHeader, btnOutlineCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminProduct, listMovements } from "@/lib/services/admin";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const data = await getAdminProduct(id);
  if (!data) notFound();
  const { product: p, images, variants } = data;
  const created = (await searchParams).created === "1";
  const history = await listMovements({ q: p.name, limit: 20 });

  return (
    <>
      <PageHeader
        title={p.name}
        sub={`${p.status === "active" ? "Visible in store" : p.status === "draft" ? "Draft — hidden from store" : "Archived — hidden from store"} · ID ${p.id}`}
        actions={
          p.status === "active" ? (
            <Link href={`/products/${p.slug}`} target="_blank" className={btnOutlineCls}>
              <ExternalLink className="size-4" strokeWidth={1.5} aria-hidden /> View in store
            </Link>
          ) : undefined
        }
      />
      {created && (
        <p role="status" className="mb-6 border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          Product created. Next: upload photos, add stock, then set the status to Active.
        </p>
      )}

      <div className="grid gap-8">
        <Card title="Photos">
          <ImageManager
            productId={p.id}
            colours={p.colourIds}
            images={images.map((i) => ({ id: i.id, colour: i.colour, url: i.url, alt: i.alt, view: i.view, isPlaceholder: i.isPlaceholder }))}
          />
        </Card>

        <Card title="Stock by colour & size" actions={<Link href={`/admin/inventory?q=${encodeURIComponent(p.name)}`} className="text-xs text-mist underline underline-offset-4">Open in inventory</Link>}>
          <VariantTable variants={variants.map((v) => ({ id: v.id, colour: v.colour, size: v.size, sku: v.sku, stock: v.stock, active: v.active }))} lowThreshold={p.lowStockThreshold} />
          {history.length > 0 && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-xs uppercase tracking-wider text-mist">Recent stock movements</summary>
              <ul className="mt-3 space-y-1 text-xs">
                {history.map((m) => (
                  <li key={m.id} className="flex flex-wrap gap-x-3 text-mist">
                    <span>{m.createdAt.toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                    <span className="font-mono">{m.sku}</span>
                    <span className={cn("font-mono", m.delta > 0 ? "text-emerald-300" : "text-red-300")}>{m.delta > 0 ? `+${m.delta}` : m.delta}</span>
                    <span>→ {m.stockAfter}</span>
                    <span>
                      {m.reason}
                      {m.note && ` · ${m.note}`}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </Card>

        <Card title="Details">
          <ProductForm
            initial={{
              id: p.id,
              name: p.name,
              slug: p.slug,
              tagline: p.tagline,
              description: p.description,
              price: p.price,
              compareAtPrice: p.compareAtPrice ?? "",
              category: p.category,
              gender: p.gender,
              collections: p.collections,
              colourIds: p.colourIds,
              sizes: p.sizes,
              fabric: p.fabric,
              gsm: p.gsm,
              composition: p.composition.map((c) => `${c.material} ${c.percent}`).join(", "),
              fit: p.fit,
              stretch: p.stretch,
              features: p.features.join("\n"),
              care: p.care.join("\n"),
              badges: p.badges,
              featuredRank: p.featuredRank,
              lowStockThreshold: p.lowStockThreshold,
              status: p.status,
            }}
          />
        </Card>
      </div>
    </>
  );
}
