import Link from "next/link";
import { StockAdjustForm } from "@/components/admin/StockAdjustForm";
import { Card, Empty, Filters, PageHeader, StockPill, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { stockStatus } from "@/lib/catalog-utils";
import { listInventory, listMovements, type StockFilter } from "@/lib/services/admin";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS: { id: StockFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "in", label: "Available" },
  { id: "low", label: "Low stock" },
  { id: "out", label: "Out of stock" },
];

const REASON: Record<string, string> = {
  received: "Received",
  adjustment: "Removed",
  correction: "Count correction",
  sale: "Sale",
  cancellation: "Cancellation",
  return: "Return",
};

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string; history?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const filter = (FILTERS.some((f) => f.id === sp.filter) ? sp.filter : "all") as StockFilter;
  const [rows, moves] = await Promise.all([listInventory({ q: sp.q, filter }), listMovements({ q: sp.history, limit: 150 })]);
  const qs = (f: string) => `/admin/inventory?filter=${f}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`;

  return (
    <>
      <PageHeader title="Inventory" sub="Stock is tracked per colour and size. Every change is recorded below." />
      <nav aria-label="Stock filter" className="mb-4 flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <Link
            key={f.id}
            href={qs(f.id)}
            aria-current={filter === f.id ? "page" : undefined}
            className={cn("h-9 border px-3 text-xs uppercase leading-9 tracking-wider", filter === f.id ? "border-bone bg-bone text-ink" : "border-line text-mist hover:text-bone")}
          >
            {f.label}
          </Link>
        ))}
      </nav>
      <Filters q={sp.q} placeholder="Search product or SKU">
        <input type="hidden" name="filter" value={filter} />
      </Filters>

      {rows.length ? (
        <Table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Colour / size</th>
              <th>Status</th>
              <th>Adjust</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id}>
                <td>
                  <Link href={`/admin/products/${v.productId}`} className="hover:underline">
                    {v.productName}
                  </Link>
                </td>
                <td className="font-mono text-xs">{v.sku}</td>
                <td className="text-xs uppercase text-mist">
                  {v.colour} / {v.size}
                </td>
                <td>
                  <StockPill status={stockStatus(v.stock, v.lowThreshold)} stock={v.stock} />
                </td>
                <td>
                  <StockAdjustForm variantId={v.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Empty>No variants match.</Empty>
      )}

      <Card title="Stock movement history" className="mt-10">
        <form className="mb-4 flex gap-2" role="search">
          <input type="hidden" name="filter" value={filter} />
          {sp.q && <input type="hidden" name="q" value={sp.q} />}
          <input name="history" defaultValue={sp.history} placeholder="Filter by product, SKU or note" aria-label="Filter history" className="h-10 w-full max-w-sm border border-line bg-transparent px-3 text-sm" />
        </form>
        {moves.length ? (
          <Table>
            <thead>
              <tr>
                <th>When</th>
                <th>Product / SKU</th>
                <th>Change</th>
                <th>After</th>
                <th>Reason</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((m) => (
                <tr key={m.id}>
                  <td className="whitespace-nowrap text-xs text-mist">{m.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td>
                    {m.productName}
                    <div className="font-mono text-[0.6875rem] text-mist">{m.sku}</div>
                  </td>
                  <td className={cn("font-mono", m.delta > 0 ? "text-emerald-300" : "text-red-300")}>{m.delta > 0 ? `+${m.delta}` : m.delta}</td>
                  <td className="font-mono">{m.stockAfter}</td>
                  <td className="text-xs">
                    {REASON[m.reason] ?? m.reason}
                    {m.note && <div className="text-mist">{m.note}</div>}
                    {m.orderId && (
                      <Link href={`/admin/orders/${m.orderId}`} className="text-mist underline underline-offset-2">
                        View order
                      </Link>
                    )}
                  </td>
                  <td className="max-w-36 truncate text-xs text-mist">{m.actor ?? "system"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Empty>No stock movements yet.</Empty>
        )}
      </Card>
    </>
  );
}
