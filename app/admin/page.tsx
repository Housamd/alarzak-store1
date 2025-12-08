// app/admin/page.tsx
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  // إجمالي الطلبات + إجمالي المبيعات
  const orderStats = await prisma.order.aggregate({
    _count: true,
    _sum: {
      total: true,
    },
  });

  const customersCount = await prisma.customer.count();

  const ordersCount = orderStats._count;
  const totalRevenueNumber = Number(
    orderStats._sum.total ?? 0
  );
  const totalRevenue = totalRevenueNumber.toFixed(2);

  // آخر 5 طلبات
  const latestOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      customer: true,
    },
  });

  return (
    <main className="space-y-6">
      {/* كروت إحصائية */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-lg bg-white p-4 text-sm">
          <p className="text-xs text-gray-500">
            Total orders
          </p>
          <p className="text-2xl font-semibold mt-1">
            {ordersCount}
          </p>
        </div>

        <div className="border rounded-lg bg-white p-4 text-sm">
          <p className="text-xs text-gray-500">
            Total recorded revenue
          </p>
          <p className="text-2xl font-semibold mt-1">
            £{totalRevenue}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Based on order totals stored in the system. Your
            official numbers remain in Xero / accounting.
          </p>
        </div>

        <div className="border rounded-lg bg-white p-4 text-sm">
          <p className="text-xs text-gray-500">
            Registered customers
          </p>
          <p className="text-2xl font-semibold mt-1">
            {customersCount}
          </p>
        </div>
      </section>

      {/* آخر الطلبات */}
      <section className="border rounded-lg bg-white p-4 text-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">
            Latest orders
          </h2>
          <a
            href="/admin/orders"
            className="text-[11px] text-blue-600 hover:underline"
          >
            View all orders →
          </a>
        </div>

        {latestOrders.length === 0 ? (
          <p className="text-xs text-gray-600">
            No orders yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="py-2 px-2 text-left">
                    Order
                  </th>
                  <th className="py-2 px-2 text-left">
                    Customer
                  </th>
                  <th className="py-2 px-2 text-left">
                    Created
                  </th>
                  <th className="py-2 px-2 text-right">
                    Total
                  </th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((order) => {
                  const createdAt = new Date(
                    order.createdAt
                  ).toLocaleString();
                  const total = Number(
                    order.total
                  ).toFixed(2);

                  const customerName =
                    order.customerName ||
                    order.customer?.name ||
                    "Unknown";

                  return (
                    <tr
                      key={order.id}
                      className="border-b last:border-0"
                    >
                      <td className="py-2 px-2">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="py-2 px-2">
                        {customerName}
                      </td>
                      <td className="py-2 px-2">
                          {createdAt}
                      </td>
                      <td className="py-2 px-2 text-right">
                        £{total}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <a
                          href={`/admin/orders/${order.id}`}
                          className="text-[11px] text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
