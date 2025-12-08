// app/api/admin/orders/export/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// نصدر CSV للطلبات لاحتياجات التقارير / المحاسبة
export async function GET() {
  // نجلب الطلبات مع بيانات الزبون
  const orders = (await prisma.order.findMany({
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as any[];

  // رؤوس الأعمدة في CSV
  const header = [
    "OrderID",
    "CreatedAt",
    "Status",
    "CustomerName",
    "BusinessName",
    "Phone",
    "City",
    "Postcode",
    "TotalGBP",
  ];

  // تحويل الطلبات إلى صفوف CSV
  const rows = orders.map((o) => {
    const createdAt =
      o.createdAt instanceof Date
        ? o.createdAt.toISOString()
        : String(o.createdAt);

    const total =
      typeof o.total === "number"
        ? o.total.toFixed(2)
        : "0.00";

    return [
      o.id || "",
      createdAt,
      o.status || "NEW",
      o.customerName || "",
      o.customer?.businessName || "",
      o.phone || "",
      o.city || "",
      o.postcode || "",
      total,
    ];
  });

  // نبني محتوى CSV كنص
  const csvLines = [
    header.join(","), // السطر الأول: الرؤوس
    ...rows.map((r) =>
      r
        .map((v) => {
          const s = String(v ?? "");
          // نهرب الفواصل وعلامات الاقتباس
          if (s.includes(",") || s.includes('"')) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(",")
    ),
  ];

  const csvContent = csvLines.join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="orders-export.csv"',
    },
  });
}
