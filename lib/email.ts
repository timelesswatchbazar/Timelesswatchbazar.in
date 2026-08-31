import { Resend } from "resend";
import { formatMoney } from "@/lib/money";
import { SITE_EMAIL, SITE_NAME, SITE_PHONE_DISPLAY, SITE_URL } from "@/lib/site";

function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

/** From address. Use a verified Resend domain in production. */
function fromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    `${SITE_NAME} <onboarding@resend.dev>`
  );
}

function storeInbox() {
  return process.env.STORE_NOTIFY_EMAIL?.trim() || SITE_EMAIL;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type OrderEmailLine = {
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type OrderEmailPayload = {
  orderNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string;
  total: number;
  lines: OrderEmailLine[];
};

function orderItemsHtml(lines: OrderEmailLine[]) {
  return lines
    .map(
      (line) => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(line.product_name)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:center;">${line.quantity}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatMoney(line.unit_price)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatMoney(line.line_total)}</td>
      </tr>`,
    )
    .join("");
}

function orderDetailsBlock(order: OrderEmailPayload) {
  return `
    <p style="margin:0 0 8px;"><strong>Order number:</strong> ${escapeHtml(order.orderNumber)}</p>
    <p style="margin:0 0 8px;"><strong>Order ID:</strong> ${escapeHtml(order.orderId)}</p>
    <p style="margin:0 0 8px;"><strong>Payment:</strong> Cash on Delivery (COD)</p>
    <p style="margin:0 0 16px;"><strong>Total:</strong> ${formatMoney(order.total)}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f3f4f6;text-align:left;">
          <th style="padding:10px 8px;">Item</th>
          <th style="padding:10px 8px;text-align:center;">Qty</th>
          <th style="padding:10px 8px;text-align:right;">Price</th>
          <th style="padding:10px 8px;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${orderItemsHtml(order.lines)}
      </tbody>
    </table>
    <p style="margin:20px 0 8px;"><strong>Ship to</strong></p>
    <p style="margin:0;line-height:1.5;">
      ${escapeHtml(order.customerName)}<br/>
      ${escapeHtml(order.shippingAddress)}<br/>
      ${escapeHtml(order.city)}, India<br/>
      Phone: ${escapeHtml(order.customerPhone)}<br/>
      Email: ${escapeHtml(order.customerEmail)}
    </p>
    ${
      order.notes?.trim()
        ? `<p style="margin:16px 0 0;"><strong>Notes:</strong> ${escapeHtml(order.notes.trim())}</p>`
        : ""
    }
  `;
}

export async function sendOrderEmails(order: OrderEmailPayload) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — order emails skipped");
    return { ok: false as const, error: "Email not configured" };
  }

  const from = fromAddress();
  const inbox = storeInbox();
  const details = orderDetailsBlock(order);

  const customerHtml = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;max-width:640px;margin:0 auto;">
      <h1 style="font-size:22px;margin:0 0 12px;">Thank you for your order</h1>
      <p style="margin:0 0 16px;">Hi ${escapeHtml(order.customerName)}, we received your order at ${SITE_NAME}.</p>
      ${details}
      <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">
        Track anytime at <a href="${SITE_URL}/track-order">${SITE_URL}/track-order</a>
        using your order number and email.<br/>
        Questions? Call/WhatsApp ${SITE_PHONE_DISPLAY} or reply to this email.
      </p>
    </div>
  `;

  const storeHtml = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;max-width:640px;margin:0 auto;">
      <h1 style="font-size:22px;margin:0 0 12px;">New COD order</h1>
      <p style="margin:0 0 16px;">A new order was placed on ${SITE_NAME}.</p>
      ${details}
    </div>
  `;

  try {
    const [customerResult, storeResult] = await Promise.all([
      resend.emails.send({
        from,
        to: order.customerEmail,
        replyTo: inbox,
        subject: `Order confirmed — ${order.orderNumber} | ${SITE_NAME}`,
        html: customerHtml,
      }),
      resend.emails.send({
        from,
        to: inbox,
        replyTo: order.customerEmail,
        subject: `New order ${order.orderNumber} — ${order.customerName}`,
        html: storeHtml,
      }),
    ]);

    const error =
      customerResult.error?.message || storeResult.error?.message || null;
    if (error) {
      console.error("[email] order send failed:", error);
      return { ok: false as const, error };
    }
    return { ok: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email failed";
    console.error("[email] order send exception:", message);
    return { ok: false as const, error: message };
  }
}

export async function sendContactEmail(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const resend = getResend();
  if (!resend) {
    return { ok: false as const, error: "Email is not configured yet." };
  }

  const from = fromAddress();
  const inbox = storeInbox();
  const phone = input.phone?.trim() || "—";

  try {
    const { error } = await resend.emails.send({
      from,
      to: inbox,
      replyTo: input.email,
      subject: `Contact form — ${input.name} | ${SITE_NAME}`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;max-width:640px;margin:0 auto;">
          <h1 style="font-size:20px;margin:0 0 16px;">New contact message</h1>
          <p style="margin:0 0 8px;"><strong>Name:</strong> ${escapeHtml(input.name)}</p>
          <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(input.email)}</p>
          <p style="margin:0 0 8px;"><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p style="margin:16px 0 8px;"><strong>Message</strong></p>
          <p style="margin:0;white-space:pre-wrap;line-height:1.5;">${escapeHtml(input.message)}</p>
        </div>
      `,
    });

    if (error) {
      console.error("[email] contact send failed:", error.message);
      return { ok: false as const, error: error.message };
    }
    return { ok: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email failed";
    console.error("[email] contact send exception:", message);
    return { ok: false as const, error: message };
  }
}
