// lib/pdf/generateOrderPDF.ts
import PDFDocument from "pdfkit";

export async function generateOrderPDF(order: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk as Buffer));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => {
        console.error("PDFKit internal error:", err);
        reject(err);
      });

      // ========= تجهيز بيانات آمنة =========
      const createdAt = order?.createdAt
        ? new Date(order.createdAt)
        : new Date();

      const customerName =
        order?.customerName ??
        order?.customer?.name ??
        "Customer";

      const street = order?.street ?? "";
      const city = order?.city ?? "";
      const postcode = order?.postcode ?? "";
      const phone = order?.phone ?? "";
      const customerType =
        order?.customerType ?? order?.customer?.customerType ?? "";

      const items: any[] = Array.isArray(order?.items)
        ? order.items
        : [];

      const subtotal = Number(order?.subtotal ?? 0);
      const vat = Number(order?.vat ?? 0);
      const total = Number(order?.total ?? subtotal + vat);

      const formatMoney = (val: any) =>
        `£${Number(val || 0).toFixed(2)}`;

      // ========= HEADER =========
      doc.fontSize(18).text("Al-Razak Cash & Carry", {
        align: "left",
      });
      doc
        .fontSize(10)
        .fillColor("#555555")
        .text("Unit D26b–D27, New Smithfield Market", {
          align: "left",
        })
        .text("Whitworth Street East, Openshaw, M11 2WP", {
          align: "left",
        })
        .moveDown(1);

      doc
        .fillColor("#000000")
        .fontSize(14)
        .text("Order confirmation", {
          align: "right",
        });

      doc
        .fontSize(10)
        .fillColor("#555555")
        .text(`Order ID: ${order?.id ?? "-"}`, {
          align: "right",
        })
        .text(`Date: ${createdAt.toLocaleString()}`, {
          align: "right",
        })
        .moveDown(1.5);

      // ========= CUSTOMER DETAILS =========
      doc.fillColor("#000000").fontSize(11).text("Bill to:", 50, doc.y);

      doc
        .fontSize(10)
        .fillColor("#333333")
        .text(customerName, { indent: 20 });

      const addrParts: string[] = [];
      if (street) addrParts.push(street);
      if (city) addrParts.push(city);
      if (postcode) addrParts.push(postcode);

      if (addrParts.length > 0) {
        doc.text(addrParts.join(", "), { indent: 20 });
      }

      if (phone) {
        doc.text(`Phone: ${phone}`, { indent: 20 });
      }

      if (customerType) {
        doc.text(`Customer type: ${customerType}`, {
          indent: 20,
        });
      }

      doc.moveDown(2);

      // ========= TABLE HEADER =========
      let y = doc.y;
      doc
        .fontSize(10)
        .fillColor("#000000")
        .text("Product", 50, y)
        .text("Qty", 260, y)
        .text("Unit price", 300, y, {
          width: 80,
          align: "right",
        })
        .text("Line total", 400, y, {
          width: 80,
          align: "right",
        });

      doc
        .moveTo(50, y + 12)
        .lineTo(530, y + 12)
        .strokeColor("#cccccc")
        .stroke();

      y += 18;

      // ========= TABLE ROWS =========
      doc.fontSize(9).fillColor("#333333");

      for (const item of items) {
        if (y > 720) {
          doc.addPage();
          y = 60;
        }

        const qty = Number(item?.qty ?? 0);
        const unitPrice = Number(item?.unitPrice ?? 0);
        const lineTotal = qty * unitPrice;

        const product = item?.product ?? {};
        const name = product?.nameEn ?? "Product";
        const sku = product?.sku ?? "";
        const vatRate =
          typeof product?.vatRate === "number"
            ? product.vatRate
            : 20;
        const vatText =
          vatRate === 0
            ? "VAT: 0% (exempt)"
            : `VAT: ${vatRate}%`;

        // اسم المنتج
        doc.text(name, 50, y, { width: 200 });

        // سطر ثاني: SKU + VAT
        const metaLines: string[] = [];
        if (sku) metaLines.push(`SKU: ${sku}`);
        metaLines.push(vatText);

        doc
          .fontSize(8)
          .fillColor("#777777")
          .text(metaLines.join(" • "), 50, y + 10, {
            width: 260,
          })
          .fontSize(9)
          .fillColor("#333333");

        // الكمية
        doc.text(String(qty), 260, y, {
          width: 40,
          align: "left",
        });

        // السعر و مجموع السطر
        doc.text(formatMoney(unitPrice), 300, y, {
          width: 80,
          align: "right",
        });
        doc.text(formatMoney(lineTotal), 400, y, {
          width: 80,
          align: "right",
        });

        y += 26;
      }

      // ========= TOTALS =========
      doc.moveDown(2);
      let totalsY = doc.y;

      doc
        .fontSize(10)
        .fillColor("#000000")
        .text("Subtotal (excl. VAT)", 320, totalsY, {
          width: 120,
          align: "right",
        })
        .text(formatMoney(subtotal), 450, totalsY, {
          width: 80,
          align: "right",
        });

      totalsY += 14;

      doc
        .fontSize(10)
        .fillColor("#000000")
        .text("VAT total", 320, totalsY, {
          width: 120,
          align: "right",
        })
        .text(formatMoney(vat), 450, totalsY, {
          width: 80,
          align: "right",
        });

      totalsY += 14;

      doc
        .fontSize(11)
        .fillColor("#000000")
        .text("Total (incl. VAT)", 320, totalsY, {
          width: 120,
          align: "right",
        })
        .text(formatMoney(total), 450, totalsY, {
          width: 80,
          align: "right",
        });

      doc.moveDown(2);

      doc
        .fontSize(8)
        .fillColor("#777777")
        .text(
          "VAT is calculated per product based on the applicable rate (e.g. 0% or 20%). Each line above shows the VAT rate applied.",
          { align: "left" }
        );

      doc.end();
    } catch (err) {
      console.error("generateOrderPDF error (outer):", err);
      reject(err);
    }
  });
}
