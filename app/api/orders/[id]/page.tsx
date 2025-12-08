// app/admin/orders/[id]/page.tsx

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrderView({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!order) {
    return <p className="p-6 text-red-600">Order not found.</p>;
  }

  return (
    <main className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">Order #{order.id}</h1>

      <section className="border rounded-lg p-4">
        <h2 className="font-semibold mb-2">Customer</h2>
        <p>{order.customerName}</p>
        {order.businessName && <p>{order.businessName}</p>}
        <p>
          {order.street}, {order.city}, {order.postcode}
        </p>
        <p>{order.phone}</p>
        {order.email && <p>{order.email}</p>}
      </section>

      <section className="border rounded-lg p-4">
        <h2 className="font-semibold mb-2">Items</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1">
            <span>
              {item.qty} × {item.product.nameEn}
            </span>
            <span>£{Number(item.unitPrice).toFixed(2)}</span>
          </div>
        ))}
      </section>

      <section className="border rounded-lg p-4">
        <h2 className="font-semibold mb-2">Totals</h2>
        <p>Subtotal: £{Number(order.subtotal).toFixed(2)}</p>
        <p>VAT: £{Number(order.vat).toFixed(2)}</p>
        <p className="font-semibold text-lg mt-2">
          Total: £{Number(order.total).toFixed(2)}
        </p>
      </section>

      <a
        href={`/api/orders/${order.id}/pdf`}
        className="inline-block px-4 py-2 bg-black text-white rounded"
      >
        Download PDF
      </a>
    </main>
  );
}
