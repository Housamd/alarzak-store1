// app/api/orders/[id]/pdf/route.ts

// مهم جداً: نضمن استخدام Node.js runtime لأن pdfkit لا يعمل على Edge
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { generateOrderPDF } from "@/lib/pdf/generateOrderPDF";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    });

    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    const pdf = await generateOrderPDF(order);

    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // inline = يفتح في التبويب مباشرة، من هناك تطبع
        "Content-Disposition": `inline; filename=order-${order.id}.pdf`,
      },
    });
  } catch (err) {
    console.error("Error generating order PDF:", err);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
