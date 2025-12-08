// lib/pdf/generateOrderPDF.ts

// نستخدم import ديناميكي حتى نضمن أن pdfkit لا يُحمَّل إلا في Node.js runtime
export async function generateOrderPDF(order: any): Promise<Buffer> {
  const PDFKit = (await import("pdfkit")).default;
  const doc = new PDFKit({ size: "A4", margin: 40 });

  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer);
    });

    doc.on("error", (err) => {
      reject(err);
    });

    // ====== محتوى الفاتورة (نسخة بسيطة وواقعية) ======

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
      order.customerType ??
      order.customer?.customerType ??
      null;

    const items = Array.isArray(order.items)
      ? order.items
      : [];

    const subtotal = Number(order.subtotal ?? 0);
    const vat = Number(order.vat ?? 0);
    const total = Number(order.total ?? subtotal + vat);

    const addressParts: string[] = [];
    if (street) addressParts.push(street);
    if (city) addressParts.push(city);
    if (postcode) addressParts.push(postcode);
    const address =
      addressParts.length > 0
        ? addressParts.join(", ")
        : "-";

    const formatMoney = (v: any) =>
      `£${Number(v || 0).toFixed(2)}`;

    // ====== رأس الفاتورة ======
    doc.fontSize(18).text("Al-Razak Cash & Carry", {
      align: "left",
    });
    doc.moveDown(0.3);
    doc
      .fontSize(10)
      .text(
        "Unit D26b–D27, New Smithfield Market",
        { align: "left" }
      );
    doc.text(
      "Whitworth Street East, Openshaw, M11 2WP",
      { align: "left" }
    );

    doc.moveDown(1);

    doc
      .fontSize(14)
      .text("Order confirmation", { align: "left" });
    doc.moveDown(0.3);
    doc.fontSize(10);
    doc.text(`Order ID: ${order.id}`);
    doc.text(`Date: ${createdAt.toLocaleString()}`);

    doc.moveDown(1);

    // ====== بيانات العميل ======
    doc
      .fontSize(12)
      .text("Bill to:", { underline: true });
    doc.moveDown(0.3);

    doc.fontSize(10).text(customerName);
    if (customerType) {
      doc.text(`Type: ${customerType}`);
    }
    if (address !== "-") {
      doc.text(address);
    }
    if (phone) {
      doc.text(`Phone: ${phone}`);
    }

    doc.moveDown(1);

    // ====== جدول العناصر ======
    doc.fontSize(12).text("Items:", {
      underline: true,
    });
    doc.moveDown(0.5);
    doc.fontSize(10);

    // رأس الجدول
    const startX = 40;
    let y = doc.y;

    doc.text("Product", startX, y);
    doc.text("Qty", startX + 260, y, { width: 40 });
    doc.text("Unit price", startX + 310, y, {
      width: 80,
      align: "right",
    });
    doc.text("Line total", startX + 400, y, {
      width: 80,
      align: "right",
    });

    y += 16;
    doc.moveTo(startX, y).lineTo(550, y).stroke();
    y += 4;

    for (const item of items) {
      const qty = Number(item.qty ?? 0);
      const unitPrice = Number(item.unitPrice ?? 0);
      const lineTotal = qty * unitPrice;
      const product = item.product ?? {};
      const name = product.nameEn ?? "Product";
      const sku = product.sku ?? "";

      const line1 = name;
      const line2 = sku ? `SKU: ${sku}` : "";

      doc.text(line1, startX, y, {
        width: 240,
      });
      if (line2) {
        doc
          .fontSize(8)
          .fillColor("#666666")
          .text(line2, startX, y + 11, {
            width: 240,
          })
          .fillColor("#000000")
          .fontSize(10);
      }

      doc.text(String(qty), startX + 260, y, {
        width: 40,
      });
      doc.text(formatMoney(unitPrice), startX + 310, y, {
        width: 80,
        align: "right",
      });
      doc.text(formatMoney(lineTotal), startX + 400, y, {
        width: 80,
        align: "right",
      });

      y += 24;
      if (y > 760) {
        doc.addPage();
        y = doc.y;
      }
    }

    doc.moveDown(1.5);

    // ====== المجاميع ======
    doc.text("", 400); // نحرك المؤشر للعمود الأيمن تقريباً
    const summaryY = doc.y;

    doc.text(`Subtotal: ${formatMoney(subtotal)}`, 360, summaryY, {
      align: "left",
    });
    doc.text(`VAT: ${formatMoney(vat)}`, 360, summaryY + 14, {
      align: "left",
    });
    doc.text(
      `Total: ${formatMoney(total)}`,
      360,
      summaryY + 28,
      {
        align: "left",
      }
    );

    doc.moveDown(3);
    doc
      .fontSize(8)
      .fillColor("#555555")
      .text(
        "For printing: use your browser's print function and select A4 paper size.",
        {
          align: "left",
        }
      );

    // إنهاء المستند
    doc.end();
  });
}
