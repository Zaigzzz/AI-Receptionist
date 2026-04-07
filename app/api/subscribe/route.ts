import { Resend } from "resend";
import { NextResponse } from "next/server";
import { emailLayout, emailButton, emailFeatureList } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limiter: max 3 requests per IP per minute
const rateMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 3;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "ProAnswer <noreply@proanswer.dev>",
      to: email,
      subject: "You're on the list — ProAnswer",
      html: emailLayout({
        preheader: "Thanks for your interest in ProAnswer — here's what's next.",
        body: `
          <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#09090b;line-height:1.3;">
            You're on the list
          </h1>
          <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.7;">
            Hey there — thanks for your interest in ProAnswer. We're glad you're here.
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.7;">
            We'll be reaching out shortly to get everything set up for you. Here's a quick reminder of what you're getting:
          </p>
          ${emailFeatureList([
            "24/7 AI receptionist — never miss a call",
            "Instant call answering, nights &amp; weekends",
            "Your AI is live within 24 hours of signup",
          ])}
          ${emailButton("Visit ProAnswer", "https://proanswer.dev")}
        `,
      }),
    });

    await resend.emails.send({
      from: "ProAnswer <noreply@proanswer.dev>",
      to: process.env.FOUNDER_EMAIL ?? process.env.YOUR_EMAIL!,
      subject: `New signup: ${email}`,
      html: `<p>New subscriber: <strong>${email}</strong></p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
