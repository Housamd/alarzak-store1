// lib/email/sendEmail.ts
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
let resend: Resend | null = null;

if (apiKey) {
  // لو في مفتاح، نفعّل Resend
  resend = new Resend(apiKey);
} else {
  // في Vercel (أو لوكالي) بدون مفتاح → لا نرمي Error، فقط تحذير
  console.warn(
    "RESEND_API_KEY is not set. Order confirmation emails will NOT be sent."
  );
}

export async function sendOrderEmail(order: any) {
  // لو ما في Resend مفعّل، نخرج بصمت
  if (!resend) {
    return;
  }

  // نحاول نحدد الإيميل الهدف من order.email أو من customer.email
  const toEmail =
    order.email ||
    order.customer?.email ||
    null;

  if (!toEmail) {
    return;
  }

  const subject = `Your Al-Razak order ${order.id}`;

  // نص بسيط، يكفي كبداية
  const textLines: string[] = [];

  textLines.push("Thank you for your order from Al-Razak Cash & Carry.");
  textLines.push("");
  textLines.push(`Order reference: ${order.id}`);

  if (order.createdAt) {
    const dt = new Date(order.createdAt);
    textLines.push(
      `Date: ${dt.toLocaleString("en-GB")}`
    );
  }

  if (order.customerName) {
    textLines.push(`Name: ${order.customerName}`);
  }

  if (order.street || order.city || order.postcode) {
    textLines.push(
      `Address: ${[
        order.street,
        order.city,
        order.postcode,
      ]
        .filter(Boolean)
        .join(", ")}`
    );
  }

  textLines.push("");
  textLines.push(
    `Subtotal: £${Number(order.subtotal || 0).toFixed(2)}`
  );
  textLines.push(
    `VAT: £${Number(order.vat || 0).toFixed(2)}`
  );
  textLines.push(
    `Total: £${Number(order.total || 0).toFixed(2)}`
  );
  textLines.push("");
  textLines.push(
    "A detailed invoice can be printed or saved as PDF from your order confirmation page."
  );

  const text = textLines.join("\n");

  await resend.emails.send({
    from: "Al-Razak <orders@alarzak.com>",
    to: toEmail,
    subject,
    text,
  });
}
