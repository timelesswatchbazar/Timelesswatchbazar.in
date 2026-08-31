"use server";

import { sendContactEmail } from "@/lib/email";

export async function submitContactForm(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = (input.phone || "").trim();
  const message = input.message.trim();

  if (!name || !email || !message) {
    return { ok: false as const, error: "Name, email, and message are required." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: "Enter a valid email address." };
  }

  return sendContactEmail({ name, email, phone, message });
}
