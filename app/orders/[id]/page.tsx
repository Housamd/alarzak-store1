// app/orders/[id]/page.tsx
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
};

// دالة حساب الشحن: 4 باوند لكل 14 كغ أو جزء منها
function calculateShippingGBP(totalWeightKg: number): number {
  if (totalWeightKg <= 0) return 0;
  const units = Math.ceil(totalWeightKg / 14);
  return units * 4;
}

export default async function OrderInvoicePage({ params }: PageProps) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: true } },
      customer: true,
    },
  });

  if (!order) {
    return (
      <main className="max-w-xl mx-auto py-10 px-4">
        <h1 className="text-xl font-semibold mb-4">
          Order not found
        </h1>
        <p className="text-sm text-gray-600">
          There is no order with ID: {params.id}
        </p>
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

  const street = order.street ?? "";
  const city = order.city ?? "";
  const postcode = order.postcode ?? "";
  const phone = order.phone ?? "";
  const customerType =
    order.customerType ?? order.customer?.customerType ?? "";

  const items = Array.isArray(order.items) ? order.items : [];

  const subtotal = Number(order.subtotal ?? 0);
  const vat = Number(order.vat ?? 0);
  const totalFromDb = Number(order.total ?? subtotal + vat);

  // نحسب الوزن من المنتجات
  const totalWeightKg = items.reduce((sum, item) => {
    const weightPerUnit = item.product?.grossWeightKg
      ? Number(item.product.grossWeightKg)
      : 0;
    return sum + weightPerUnit * item.qty;
  }, 0);

  // نحسب الشحن حسب الوزن
  const shippingGBP = calculateShippingGBP(totalWeightKg);

  // نفترض أن total في قاعدة البيانات = subtotal + vat + shipping
  // لو total في DB غير مضبوط، هذا السطر سيعرّي الفارق:
  const recomputedTotal = subtotal + vat + shippingGBP;

  const formatMoney = (val: any) =>
    `£${Number(val || 0).toFixed(2)}`;

  const addressParts: string[] = [];
  if (street) addressParts.push(street);
  if (city) addressParts.push(city);
  if (postcode) addressParts.push(postcode);
  const address =
    addressParts.length > 0 ? addressParts.join(", ") : "-";

  return (
    <main className="max-w-3xl mx-auto py-8 px-4 bg-white text-black">
      {/* رأس الفاتورة */}
      <header className="flex justify-between items-start border-b pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Al-Razak Cash &amp; Carry
          </h1>
          <p className="text-xs text-gray-600">
            Unit D26b–D27, New Smithfield Market
          </p>
          <p className="text-xs text-gray-600">
            Whitworth Street East, Openshaw, M11 2WP
          </p>
        </div>
        <div className="text-right text-xs text-gray-700">
          <p className="font-semibold text-sm">
            Order confirmation
          </p>
          <p>Order ID: {order.id}</p>
          <p>Date: {createdAt.toLocaleString()}</p>
        </div>
      </header>

      {/* بيانات العميل */}
      <section className="mb-6 text-sm">
        <h2 className="font-semibold mb-1">Bill to:</h2>
        <div className="ml-4 space-y-0.5">
          <p>{customerName}</p>
          {address !== "-" && <p>{address}</p>}
          {phone && <p>Phone: {phone}</p>}
          {customerType && (
            <p>Customer type: {customerType}</p>
          )}
        </div>
      </section>

      {/* جدول الطلب */}
      <section className="mb-6">
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
            {items.map((item) => {
              const qty = Number(item.qty ?? 0);
              const unitPrice = Number(
                item.unitPrice ?? 0
              );
              const lineTotal = qty * unitPrice;
              const product = item.product ?? {};
              const name =
                product.nameEn ?? "Product";
              const sku = product.sku ?? "";
              const vatRate =
                typeof (product as any).vatRate ===
                "number"
                  ? (product as any).vatRate
                  : 20;
              const vatText =
                vatRate === 0
                  ? "VAT: 0% (exempt)"
                  : `VAT: ${vatRate}%`;

              return (
                <tr key={item.id} className="border-b">
                  <td className="px-2 py-2 align-top">
                    <div className="font-medium">
                      {name}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {sku && <>SKU: {sku} • </>}
                      {vatText}
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
      </section>

      {/* المجاميع + الشحن */}
      <section className="flex justify-end mb-6">
        <div className="w-64 text-xs space-y-1">
          <div className="flex justify-between">
            <span>Subtotal (goods)</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT total</span>
            <span>{formatMoney(vat)}</span>
          </div>
          <div className="flex justify-between">
            <span>
              Shipping
              <span className="block text-[10px] text-gray-500">
                {`Total weight ${totalWeightKg.toFixed(
                  2
                )} kg @ £4 per 14kg`}
              </span>
            </span>
            <span>{formatMoney(shippingGBP)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-1 font-semibold">
            <span>Total (incl. VAT &amp; shipping)</span>
            <span>
              {formatMoney(totalFromDb || recomputedTotal)}
            </span>
          </div>
        </div>
      </section>

      {/* تعليمات الطباعة */}
      <section className="mt-4 border-t pt-3">
        <p className="text-[11px] text-gray-600">
          For printing: use your browser&apos;s print
          function (Ctrl+P / Cmd+P) and select A4 paper size.
        </p>
      </section>
    </main>
  );
}
