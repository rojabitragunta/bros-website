import Link from "next/link";
import { Empty, Filters, OrderStatusPill, PageHeader, PaymentPill, Table, selectCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/order-display";
import { listOrders } from "@/lib/services/admin";
import { releaseExpiredReservations } from "@/lib/services/orders";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin();
  await releaseExpiredReservations();
  const { q, status = "all" } = await searchParams;
  const orders = await listOrders({ q, status });

  return (
    <>
      <PageHeader title="Orders" sub={`${orders.length} shown`} />
      <Filters q={q} placeholder="Order #, email, name or phone">
        <select name="status" defaultValue={status} aria-label="Status" className={`${selectCls} max-w-48`}>
          <option value="all">All statuses</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </Filters>
      {orders.length ? (
        <Table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-graphite/50">
                <td>
                  <Link href={`/admin/orders/${o.id}`} className="font-mono underline-offset-4 hover:underline">
                    #{o.number}
                  </Link>
                  <div className="text-[0.6875rem] text-mist">{o.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
                </td>
                <td>
                  {o.name}
                  <div className="text-[0.6875rem] text-mist">
                    {o.email} · {o.city}
                  </div>
                </td>
                <td className="font-mono">{o.items}</td>
                <td className="font-mono">{formatPrice(o.total)}</td>
                <td>
                  <PaymentPill status={o.paymentStatus} />
                  <div className="text-[0.6875rem] text-mist">{PAYMENT_METHOD_LABEL[o.paymentMethod]}</div>
                </td>
                <td>
                  <OrderStatusPill status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Empty>No orders match.</Empty>
      )}
    </>
  );
}
