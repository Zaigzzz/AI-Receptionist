import { Resend } from "resend";
import { NextResponse } from "next/server";

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
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
        <body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;padding:40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#14532d 0%,#16a34a 100%);padding:36px 40px;text-align:center;">
                      <div style="display:inline-flex;align-items:center;gap:10px;">
                        <div style="width:40px;height:40px;background-color:#22c55e;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
                          <span style="color:white;font-size:20px;">📞</span>
                        </div>
                        <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Pro<span style="color:#6ee7b7;">Answer</span></span>
                      </div>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 40px 32px;">
                      <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#14532d;line-height:1.3;">
                        You're on the list!
                      </h1>
                      <p style="margin:0 0 16px;font-size:16px;color:#374151;line-height:1.7;">
                        Hey there — thanks for your interest in ProAnswer. We're glad you're here.
                      </p>
                      <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.7;">
                        We'll be reaching out shortly to get everything set up for you. In the meantime, here's a quick reminder of what you're getting:
                      </p>

                      <!-- Feature bullets -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:12px;padding:4px 0;margin-bottom:28px;">
                        <tr><td style="padding:12px 20px;font-size:15px;color:#15803d;">✅ &nbsp;24/7 AI receptionist — never miss a call</td></tr>
                        <tr><td style="padding:12px 20px;font-size:15px;color:#15803d;">✅ &nbsp;Instant call answering, nights & weekends</td></tr>
                        <tr><td style="padding:12px 20px;font-size:15px;color:#15803d;">✅ &nbsp;Your AI is live within 24 hours of signup</td></tr>
                      </table>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="https://proanswer.dev" style="display:inline-block;background:linear-gradient(135deg,#16a34a,#22c55e);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:0.2px;">
                              Visit ProAnswer →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:24px 40px 36px;border-top:1px solid #e5e7eb;text-align:center;">
                      <p style="margin:0 0 6px;font-size:13px;color:#9ca3af;">
                        Questions? Just reply to this email.
                      </p>
                      <p style="margin:0;font-size:13px;color:#9ca3af;">
                        © ${new Date().getFullYear()} ProAnswer · Long Island, New York
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
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
