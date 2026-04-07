import { NextResponse } from "next/server";
import { findByEmail } from "@/lib/users";
import { Resend } from "resend";
import crypto from "crypto";
import { emailLayout, emailButton } from "@/lib/email";

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
    html: emailLayout({
      preheader: "Reset your ProAnswer password",
      body: `
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#09090b;line-height:1.3;">
          Reset your password
        </h1>
        <p style="margin:0 0 8px;font-size:15px;color:#52525b;line-height:1.7;">
          Hi ${user.name},
        </p>
        <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.7;">
          We received a request to reset your password. Click the button below to set a new one.
        </p>
        ${emailButton("Reset Password", resetUrl)}
        <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;line-height:1.6;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
      `,
    }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}

// Export token store for the reset-password route to use
export { resetTokens };
