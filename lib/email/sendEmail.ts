// lib/email/sendEmail.ts
import { Resend } from "resend";

// نقرأ الـ API key من البيئة، لكن بدون !
// لو مش موجودة، نخلي الإيميل "معطّل" بدل ما نكسر السيرفر.
const apiKey = process.env.RESEND_API_KEY;

// ممكن يكون null لو ما عندك مفتاح حقيقي
const resend = apiKey ? new Resend(apiKey) : null;

/**
 * إرسال إيميل تأكيد الطلب.
 * ملاحظة: لو ما في RESEND_API_KEY، ما رح نرسل شيء، بس نطبع تحذير في الـ console.
 */
export async function sendOrderEmail(order: any, pdfBuffer?: any) {
  try {
    if (!resend) {
      console.warn(
        "[sendOrderEmail] RESEND_API_KEY is missing. Email is disabled; skipping send."
      );
      return;
    }

    // نحاول نلحق إيميل الزبون إما من الطلب نفسه أو من كائن customer
    const to =
      order?.email ||
      order?.customer?.email ||
      null;

    if (!to) {
      console.warn(
        "[sendOrderEmail] No email address on order; skipping send."
      );
      return;
    }

    const subject = `Order confirmation – ${order.id}`;

    const totalStr = (() => {
      try {
        const t = Number(order?.total ?? 0);
        return `£${t.toFixed(2)}`;
      } catch {
        return "";
      }
    })();

    const html = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">
        <h2>Thank you for your order</h2>
        <p>Order ID: <strong>${order.id}</strong></p>
        ${
          totalStr
            ? `<p>Order total: <strong>${totalStr}</strong></p>`
            : ""
        }
        <p>
          A copy of your order is available on the website in your account or
          from the printable order page.
        </p>
      </div>
    `;

    await resend.emails.send({
      from: "no-reply@example.com", // عدّلها لاحقًا لو حابب
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(
      "[sendOrderEmail] Failed to send confirmation email:",
      err
    );
    // ما نرمي الخطأ عشان ما نكسّر /api/checkout
  }
}
