import Link from "next/link";
import { Card, OrderStatusPill, PageHeader, PaymentPill, Stat, StockPill, Table, Empty } from "@/components/admin/ui";
import { stockStatus } from "@/lib/catalog-utils";
import { requireAdmin } from "@/lib/auth/session";
import { ORDER_STATUS_LABEL } from "@/lib/order-display";
import { getDashboard } from "@/lib/services/admin";
import { releaseExpiredReservations } from "@/lib/services/orders";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireAdmin();
  await releaseExpiredReservations();
  const d = await getDashboard();
  const statuses: OrderStatus[] = ["pending_payment", "placed", "packed", "shipped", "delivered", "cancelled", "returned"];

  return (
    <>
      <PageHeader title="Dashboard" sub="Orders, revenue and stock at a glance." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="To fulfil" value={d.toFulfil} href="/admin/orders?status=placed" tone={d.toFulfil ? "warn" : undefined} />
        <Stat label="Orders today" value={d.ordersToday} href="/admin/orders" />
        <Stat label="Revenue · 30 days" value={formatPrice(d.revenue30)} />
        <Stat label="Orders · 30 days" value={d.orders30} />
        <Stat label="Low-stock variants" value={d.stock.low} href="/admin/inventory?filter=low" tone={d.stock.low ? "warn" : undefined} />
        <Stat label="Out of stock" value={d.stock.out} href="/admin/inventory?filter=out" tone={d.stock.out ? "bad" : undefined} />
        <Stat label="Units in stock" value={d.stock.units} href="/admin/inventory" />
        <Stat label="Refunds pending" value={d.refundsPending} href="/admin/orders" tone={d.refundsPending ? "bad" : undefined} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card title="Recent orders" actions={<Link href="/admin/orders" className="text-xs text-mist underline underline-offset-4">All orders</Link>}>
          {d.recent.length ? (
            <Table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {d.recent.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/orders/${o.id}`} className="font-mono underline-offset-4 hover:underline">
                        #{o.number}
                      </Link>
                      <div className="text-[0.6875rem] text-mist">{o.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
                    </td>
                    <td className="max-w-40 truncate text-mist">{o.email}</td>
                    <td className="font-mono">{formatPrice(o.total)}</td>
                    <td>
                      <OrderStatusPill status={o.status} /> <PaymentPill status={o.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Empty>No orders yet.</Empty>
          )}
        </Card>

        <Card title="Needs restocking" actions={<Link href="/admin/inventory?filter=low" className="text-xs text-mist underline underline-offset-4">Inventory</Link>}>
          {d.lowList.length ? (
            <Table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {d.lowList.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link href={`/admin/products/${v.productId}`} className="hover:underline">
                        {v.productName}
                      </Link>
                      <div className="text-[0.6875rem] uppercase text-mist">
                        {v.colour} / {v.size}
                      </div>
                    </td>
                    <td className="font-mono text-xs">{v.sku}</td>
                    <td>
                      <StockPill status={stockStatus(v.stock, v.lowThreshold)} stock={v.stock} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Empty>Nothing is running low.</Empty>
          )}
        </Card>
      </div>

      <Card title="Orders by status" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <li key={s}>
              <Link href={`/admin/orders?status=${s}`} className="flex items-center gap-2 border border-line px-3 py-2 text-sm hover:border-bone/50">
                {ORDER_STATUS_LABEL[s]} <span className="font-mono text-mist">{d.byStatus[s] ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
