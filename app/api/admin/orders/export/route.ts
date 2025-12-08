// app/api/admin/orders/export/route.ts
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
];

function escapeCsv(value: any): string {
  const s =
    value === null || value === undefined
      ? ""
      : String(value);
  const escaped = s.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim() || "";

  const where: any = {};

  if (status && ALLOWED_STATUSES.includes(status)) {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { customerName: { contains: q, mode: "insensitive" } },
      { businessName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { id: { contains: q, mode: "insensitive" } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Order ID",
    "Date",
    "Status",
    "Customer Name",
    "Business Name",
    "Phone",
    "City",
    "Postcode",
    "Delivery Method",
    "Subtotal",
    "VAT",
    "Total",
  ];

  const lines: string[] = [];
  lines.push(headers.map(escapeCsv).join(","));

  for (const o of orders) {
    const row = [
      o.id,
      o.createdAt.toISOString(),
      o.status || "NEW",
      o.customerName || "",
      o.customer?.businessName || "",
      o.phone || "",
      o.city || "",
      o.postcode || "",
      o.deliveryMethod || "",
      Number(o.subtotal).toFixed(2),
      Number(o.vat).toFixed(2),
      Number(o.total).toFixed(2),
    ];

    lines.push(row.map(escapeCsv).join(","));
  }

  const csv = lines.join("\r\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type":
        "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="orders.csv"',
    },
  });
}
