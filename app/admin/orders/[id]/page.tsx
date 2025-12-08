// app/admin/orders/[id]/page.tsx

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
};

export default async function AdminOrderDetailPage({
  params,
}: PageProps) {
  // نجلب الطلب مع الزبون والعناصر
  const order = (await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  })) as any;

  if (!order) {
    return (
      <main className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-xl font-semibold mb-4">
          Order not found
        </h1>
        <p className="text-sm text-gray-600">
          There is no order with ID: {params.id}
        </p>
        <div className="mt-4">
          <Link
            href="/admin/orders"
            className="text-xs text-blue-600 hover:underline"
          >
            ← Back to orders
          </Link>
        </div>
      </main>
    );
  }

  const createdAt = order.createdAt
    ? new Date(order.createdAt)
    : new Date();

  const customerName =
    order.customerName ??
    order.customer?.name ??
    "Customer";

  const businessName =
    order.customer?.businessName ?? null;

  const street = order.street ?? "";
  const city = order.city ?? "";
  const postcode = order.postcode ?? "";
  const phone = order.phone ?? "";
  const customerType =
    order.customerType ??
    order.customer?.customerType ??
    null;

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const subtotal = Number(order.subtotal ?? 0);
  const vat = Number(order.vat ?? 0);
  const total = Number(order.total ?? subtotal + vat);

  const formatMoney = (v: any) =>
    `£${Number(v || 0).toFixed(2)}`;

  const addrParts: string[] = [];
  if (street) addrParts.push(street);
  if (city) addrParts.push(city);
  if (postcode) addrParts.push(postcode);
  const address =
    addrParts.length > 0 ? addrParts.join(", ") : "-";

  return (
    <main className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Order details
          </h1>
          <p className="text-xs text-gray-500">
            Order ID:{" "}
            <span className="font-mono">
              {order.id}
            </span>
          </p>
          <p className="text-xs text-gray-500">
            Date: {createdAt.toLocaleString()}
          </p>
        </div>
        <div className="text-right space-y-2">
          <Link
            href="/admin/orders"
            className="text-xs text-blue-600 hover:underline"
          >
            ← Back to orders
          </Link>
          <div>
            <a
              href={`/orders/${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-3 py-1 rounded border text-[11px] hover:bg-gray-50"
            >
              View / Print invoice
            </a>
          </div>
        </div>
      </div>

      {/* بيانات الزبون */}
      <section className="border rounded-lg bg-white p-4 text-xs space-y-1">
        <h2 className="font-semibold text-sm mb-1">
          Customer
        </h2>
        <p className="font-medium">
          {customerName}
        </p>
        {businessName && (
          <p>{businessName}</p>
        )}
        {address !== "-" && <p>{address}</p>}
        {phone && <p>Phone: {phone}</p>}
        {customerType && (
          <p>Type: {customerType}</p>
        )}
      </section>

      {/* عناصر الطلب */}
      <section className="border rounded-lg bg-white p-4 text-xs">
        <h2 className="font-semibold text-sm mb-2">
          Items
        </h2>
        {items.length === 0 ? (
          <p className="text-gray-500">
            No items.
          </p>
        ) : (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-2 py-2">
                  Product
                </th>
                <th className="text-left px-2 py-2">
                  Qty
                </th>
                <th className="text-right px-2 py-2">
                  Unit price
                </th>
                <th className="text-right px-2 py-2">
                  Line total
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => {
                const qty = Number(item.qty ?? 0);
                const unitPrice = Number(
                  item.unitPrice ?? 0
                );
                const lineTotal = qty * unitPrice;
                const product = item.product ?? {};
                const name =
                  product.nameEn ?? "Product";
                const sku = product.sku ?? "";

                return (
                  <tr
                    key={item.id}
                    className="border-b"
                  >
                    <td className="px-2 py-2 align-top">
                      <div className="font-medium">
                        {name}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {sku && (
                          <>SKU: {sku}</>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 align-top">
                      {qty}
                    </td>
                    <td className="px-2 py-2 align-top text-right">
                      {formatMoney(unitPrice)}
                    </td>
                    <td className="px-2 py-2 align-top text-right">
                      {formatMoney(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* المجاميع */}
      <section className="flex justify-end">
        <div className="w-64 text-xs space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT</span>
            <span>{formatMoney(vat)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-1 font-semibold">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
