import { NextResponse } from "next/server";
import { findByEmail } from "@/lib/users";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory token store — for production, use a database table
const resetTokens = new Map<string, { email: string; expiresAt: number }>();

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const user = await findByEmail(email);

  // Always return success to prevent email enumeration
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  resetTokens.set(token, { email: user.email, expiresAt: Date.now() + 3600_000 });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://proanswer.dev";
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: "ProAnswer <noreply@proanswer.dev>",
    to: user.email,
    subject: "Reset your password — ProAnswer",
    html: `
      <h2>Password Reset</h2>
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your password. Click the link below to set a new one:</p>
      <p><a href="${resetUrl}" style="display:inline-block;background:#09090b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a></p>
      <p style="color:#666;font-size:14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}

// Export token store for the reset-password route to use
export { resetTokens };
