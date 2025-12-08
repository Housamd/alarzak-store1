// app/api/orders/[id]/pdf/route.ts

export const runtime = "nodejs"; // مهم: هذا المسار يستخدم pdfkit و Buffer

import { prisma } from "@/lib/prisma";
import { generateOrderPDF } from "@/lib/pdf/generateOrderPDF";

type RouteParams = {
  params: { id: string };
};

export async function GET(
  _req: Request,
  { params }: RouteParams
) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      customer: true,
    },
  });

  if (!order) {
    return new Response("Order not found", {
      status: 404,
    });
  }

  try {
    const pdfBuffer = await generateOrderPDF(order);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=order-${order.id}.pdf`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return new Response("Failed to generate PDF", {
      status: 500,
    });
  }
}
