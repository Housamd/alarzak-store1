// app/admin/orders/[id]/page.tsx
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    return (
      <main className="space-y-4">
        <p className="text-sm text-red-600">
          Order not found.
        </p>
      </main>
    );
  }

  const createdAt = new Date(
    order.createdAt
  ).toLocaleString();
  const subtotal = Number(order.subtotal).toFixed(2);
  const vat = Number(order.vat).toFixed(2);
  const total = Number(order.total).toFixed(2);

  const customerName =
    order.customerName ||
    order.customer?.name ||
    "Unknown";

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Order #{order.id.slice(0, 8)}
          </h2>
          <p className="text-xs text-gray-500">
            Created: {createdAt}
          </p>
        </div>
        <a
          href="/admin/orders"
          className="text-[11px] text-blue-600 hover:underline"
        >
          ← Back to orders
        </a>
      </header>

      <section className="grid gap-4 md:grid-cols-2 text-xs">
        {/* بيانات العميل */}
        <div className="border rounded-lg bg-white p-3 space-y-1">
          <h3 className="text-sm font-semibold border-b pb-2 mb-1">
            Customer &amp; contact
          </h3>
          <p className="font-medium">{customerName}</p>
          {order.businessName && (
            <p>{order.businessName}</p>
          )}
          <p>{order.phone}</p>
          {order.email && <p>{order.email}</p>}
          <p className="mt-2 text-gray-500">
            Type: {order.customerType || "N/A"}
          </p>
        </div>

        {/* العنوان وطريقة التوصيل */}
        <div className="border rounded-lg bg-white p-3 space-y-1">
          <h3 className="text-sm font-semibold border-b pb-2 mb-1">
            Delivery / collection
          </h3>
          <p>{order.street}</p>
          <p>
            {order.city} {order.postcode}
          </p>
          <p className="mt-2 text-gray-500">
            Method: {order.deliveryMethod}
          </p>
          {order.notes && (
            <p className="mt-2 text-gray-500">
              Notes: {order.notes}
            </p>
          )}
        </div>
      </section>

      {/* العناصر */}
      <section className="border rounded-lg bg-white p-3 text-xs space-y-3">
        <h3 className="text-sm font-semibold border-b pb-2 mb-1">
          Order items
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="py-2 px-2 text-left">
                  Product
                </th>
                <th className="py-2 px-2 text-left">
                  SKU
                </th>
                <th className="py-2 px-2 text-right">
                  Qty
                </th>
                <th className="py-2 px-2 text-right">
                  Unit price
                </th>
                <th className="py-2 px-2 text-right">
                  Line total
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => {
                const unitPrice = Number(
                  item.unitPrice
                ).toFixed(2);
                const lineTotal = (
                  Number(item.unitPrice) * item.qty
                ).toFixed(2);

                return (
                  <tr
                    key={item.id}
                    className="border-b last:border-0"
                  >
                    <td className="py-2 px-2">
                      {item.product?.nameEn ||
                        "Product"}
                    </td>
                    <td className="py-2 px-2">
                      {item.product?.sku || ""}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {item.qty}
                    </td>
                    <td className="py-2 px-2 text-right">
                      £{unitPrice}
                    </td>
                    <td className="py-2 px-2 text-right">
                      £{lineTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-2">
          <div className="space-y-1 text-xs min-w-[180px]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>£{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>VAT</span>
              <span>£{vat}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-1 font-semibold">
              <span>Total</span>
              <span>£{total}</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 mt-2">
          For official invoicing and VAT records, please refer
          to your accounting system (e.g. Xero). This page is
          for operational use inside Al-Razak only.
        </p>
      </section>
    </main>
  );
}
