import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Empty, Filters, PageHeader, StockPill, Table, btnCls, selectCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { listAdminProducts } from "@/lib/services/admin";
import { cn, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin();
  const { q, status = "all" } = await searchParams;
  const rows = await listAdminProducts({ q, status });

  return (
    <>
      <PageHeader
        title="Products"
        sub={`${rows.length} shown`}
        actions={
          <Link href="/admin/products/new" className={btnCls}>
            <Plus className="size-4" strokeWidth={1.5} aria-hidden /> Add product
          </Link>
        }
      />
      <Filters q={q} placeholder="Search name, slug or category">
        <select name="status" defaultValue={status} aria-label="Status" className={`${selectCls} max-w-40`}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </Filters>
      {rows.length ? (
        <Table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Status</th>
              <th>Units</th>
              <th>Availability</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-graphite/50">
                <td>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                    <span className="relative h-14 w-11 shrink-0 overflow-hidden bg-[#e4e2dd]">
                      {p.thumb && <Image src={p.thumb} alt="" fill sizes="44px" className="object-cover" />}
                    </span>
                    <span>
                      <span className="block hover:underline">{p.name}</span>
                      <span className="text-[0.6875rem] uppercase text-mist">{p.category}</span>
                    </span>
                  </Link>
                </td>
                <td className="font-mono">{formatPrice(p.price)}</td>
                <td>
                  <span className={cn("text-xs uppercase tracking-wider", p.status === "active" ? "text-emerald-300" : p.status === "draft" ? "text-amber-200" : "text-mist")}>{p.status}</span>
                </td>
                <td className="font-mono">{p.units}</td>
                <td className="space-x-1">
                  {p.variantCount === 0 ? (
                    <span className="text-xs text-mist">No variants</span>
                  ) : p.outCount === p.variantCount ? (
                    <StockPill status="out_of_stock" />
                  ) : (
                    <>
                      {p.outCount > 0 && <StockPill status="out_of_stock" stock={p.outCount} />}
                      {p.lowCount > 0 && <StockPill status="low_stock" stock={p.lowCount} />}
                      {!p.outCount && !p.lowCount && <StockPill status="in_stock" />}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Empty>No products match.</Empty>
      )}
    </>
  );
}
