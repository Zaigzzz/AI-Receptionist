import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { emailLayout } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Vapi Server URL webhook — receives events for all assistants.
 *
 * Handles:
 * 1. "function-call" — when Riley calls the book_appointment tool during a call
 * 2. "end-of-call-report" — after every call, parse transcript and notify business owner
 */
export async function POST(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messageType = body.message?.type ?? body.type;

  // ── Handle function/tool call from Riley ──────────────────────────────
  if (messageType === "function-call" || messageType === "tool-calls") {
    return handleToolCall(body);
  }

  // ── Handle end-of-call report ─────────────────────────────────────────
  if (messageType === "end-of-call-report") {
    // Fire and forget — don't block Vapi's webhook
    handleEndOfCall(body).catch(console.error);
    return NextResponse.json({ ok: true });
  }

  // ── Handle assistant-request (return tool definition) ─────────────────
  if (messageType === "assistant-request") {
    // Not needed if tools are configured in Vapi dashboard
    return NextResponse.json({ ok: true });
  }

  // Default — acknowledge unknown events
  return NextResponse.json({ ok: true });
}

// ─── Tool Call Handler ──────────────────────────────────────────────────────

async function handleToolCall(body: Record<string, unknown>) {
  const message = (body.message ?? body) as Record<string, unknown>;

  // Extract function call data — Vapi sends different formats
  let functionName = "";
  let args: Record<string, string> = {};

  if (message.type === "function-call") {
    const fc = message.functionCall as Record<string, unknown> | undefined;
    functionName = (fc?.name as string) ?? "";
    args = (fc?.parameters as Record<string, string>) ?? {};
  } else if (message.type === "tool-calls") {
    const toolCalls = (message.toolCalls ?? message.toolCallList) as Array<Record<string, unknown>> | undefined;
    const first = toolCalls?.[0];
    if (first) {
      const fn = first.function as Record<string, unknown> | undefined;
      functionName = (fn?.name as string) ?? (first.name as string) ?? "";
      const rawArgs = fn?.arguments ?? first.arguments;
      args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : (rawArgs as Record<string, string>) ?? {};
    }
  }

  if (functionName !== "book_appointment") {
    return NextResponse.json({ result: "Unknown function" });
  }

  // Find the user by assistant ID
  const call = (message.call ?? body.call) as Record<string, unknown> | undefined;
  const assistantId = call?.assistantId as string | undefined;

  if (!assistantId) {
    return NextResponse.json({ result: "Booking noted — we'll follow up shortly." });
  }

  const user = await prisma.user.findFirst({ where: { vapiAssistantId: assistantId } });
  if (!user) {
    return NextResponse.json({ result: "Booking noted — we'll follow up shortly." });
  }

  const callId = call?.id as string | undefined;

  // Idempotency: skip if we already captured this call
  if (callId) {
    const existing = await prisma.booking.findUnique({ where: { vapiCallId: callId } });
    if (existing) {
      return NextResponse.json({
        result: "Appointment already booked. Is there anything else I can help with?",
      });
    }
  }

  // Create the booking
  await prisma.booking.create({
    data: {
      userId: user.id,
      callerName: args.caller_name || args.name || null,
      callerPhone: args.caller_phone || args.phone || null,
      callerAddress: args.caller_address || args.address || null,
      serviceNeeded: args.service_needed || args.service || null,
      preferredTime: args.preferred_time || args.time || null,
      notes: args.notes || null,
      source: "tool_call",
      vapiCallId: callId || null,
    },
  });

  // Send email notification to business owner
  await sendBookingEmail(user, {
    callerName: args.caller_name || args.name || "Unknown",
    callerPhone: args.caller_phone || args.phone || "Not provided",
    callerAddress: args.caller_address || args.address || undefined,
    serviceNeeded: args.service_needed || args.service || "Not specified",
    preferredTime: args.preferred_time || args.time || "Not specified",
    notes: args.notes || undefined,
  });

  // Return confirmation that Riley reads back to the caller
  return NextResponse.json({
    result: `Great, I've booked that appointment for ${args.caller_name || "you"}. ${args.preferred_time ? `We have you down for ${args.preferred_time}.` : ""} Someone from the team will confirm shortly. Is there anything else I can help with?`,
  });
}

// ─── End-of-Call Handler ────────────────────────────────────────────────────

async function handleEndOfCall(body: Record<string, unknown>) {
  const message = (body.message ?? body) as Record<string, unknown>;
  const call = (message.call ?? body.call) as Record<string, unknown> | undefined;
  const assistantId = call?.assistantId as string | undefined;
  const callId = call?.id as string | undefined;

  if (!assistantId) return;

  const user = await prisma.user.findFirst({ where: { vapiAssistantId: assistantId } });
  if (!user) return;

  // Skip if we already have a booking from a tool call for this call
  if (callId) {
    const existing = await prisma.booking.findUnique({ where: { vapiCallId: callId } });
    if (existing) return; // Already captured via tool call
  }

  const transcript = (message.transcript as string) ?? "";
  const summary = (message.summary as string) ?? "";
  const durationSeconds = (call?.duration as number) ?? (call?.durationSeconds as number) ?? 0;

  // Only process calls that actually had a conversation (> 10 seconds)
  if (durationSeconds < 10) return;

  // 1. Try Vapi's structured data first (analysis, structuredData)
  const analysis = (message.analysis as Record<string, unknown>) ?? {};
  const structuredData = (analysis.structuredData as Record<string, string>) ?? {};

  // 2. Get caller's phone from Vapi call metadata (the number they called from)
  const customer = call?.customer as Record<string, string> | undefined;
  const callerPhoneFromMeta = customer?.number || null;

  // 3. Regex extraction as fallback
  const regexExtracted = extractCallerInfo(transcript, summary);

  // Merge: prefer structured data > call metadata > regex
  const callerName = structuredData.callerName || structuredData.name || regexExtracted.callerName;
  const callerPhone = structuredData.callerPhone || structuredData.phone || callerPhoneFromMeta || regexExtracted.callerPhone;
  const callerAddress = structuredData.callerAddress || structuredData.address || regexExtracted.callerAddress;
  const serviceNeeded = structuredData.serviceNeeded || structuredData.service || regexExtracted.serviceNeeded;
  const preferredTime = structuredData.preferredTime || structuredData.time || regexExtracted.preferredTime;

  // Use Vapi's summary if available, fall back to analysis summary
  const callSummary = summary || (analysis.summary as string) || null;

  // Create a booking if we found at least a name or phone number
  if (callerName || callerPhone) {
    await prisma.booking.create({
      data: {
        userId: user.id,
        callerName: callerName || null,
        callerPhone: callerPhone || null,
        callerAddress: callerAddress || null,
        serviceNeeded: serviceNeeded || null,
        preferredTime: preferredTime || null,
        summary: callSummary,
        source: "transcript",
        vapiCallId: callId || null,
      },
    });

    // Send email notification
    await sendBookingEmail(user, {
      callerName: callerName || "Unknown caller",
      callerPhone: callerPhone || "Not captured",
      callerAddress: callerAddress || undefined,
      serviceNeeded: serviceNeeded || "Not specified",
      preferredTime: preferredTime || undefined,
      notes: callSummary || undefined,
    });
  }
}

// ─── Extract caller info from transcript using pattern matching (fallback) ──

function extractCallerInfo(transcript: string, summary: string) {
  const text = `${transcript}\n${summary}`;

  // Phone number — standard digit patterns
  const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/);
  const callerPhone = phoneMatch ? phoneMatch[0].replace(/\D/g, "").replace(/^(\d{10})$/, "+1$1") : null;

  // Name — multiple patterns, exclude "Riley" and common false positives
  let callerName: string | null = null;
  const excludeNames = new Set(["riley", "hello", "hi", "hey", "yes", "no", "okay", "sure", "well", "so", "the"]);
  const namePatterns = [
    /(?:my name is|name's|i'm|i am|this is|it's|call me)\s+([a-z]+(?:\s+[a-z]+)?)/gi,
    /(?:name|caller)[\s:]+([a-z]+(?:\s+[a-z]+)?)/gi,
  ];
  for (const pattern of namePatterns) {
    const matches = [...transcript.matchAll(pattern)];
    for (const match of matches) {
      const name = match[1]?.trim();
      if (name && name.length > 1 && !excludeNames.has(name.toLowerCase())) {
        callerName = name.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
        break;
      }
    }
    if (callerName) break;
  }

  // Address — street patterns
  const addressMatch = transcript.match(/(\d+\s+[a-z]+(?:\s+[a-z]+)*\s+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|way|court|ct|circle|place|pl|terrace|ter))/i);
  const callerAddress = addressMatch?.[1] || null;

  // Service — from summary (more reliable) or transcript
  let serviceNeeded: string | null = null;
  // Use the summary directly if it's short enough — it usually describes the service
  if (summary && summary.length < 200) {
    serviceNeeded = summary;
  } else {
    const servicePatterns = [
      /(?:need|want|looking for|requesting|calling about|help with|issue with)\s+(?:a\s+)?(.{5,60}?)(?:\.|,|$)/i,
      /(?:leaky?|broken|clogged|no|isn't|not)\s+(.{3,40}?)(?:\.|,|$)/i,
    ];
    for (const pattern of servicePatterns) {
      const match = (summary || transcript).match(pattern);
      if (match?.[1]) {
        serviceNeeded = match[1].trim();
        serviceNeeded = serviceNeeded.charAt(0).toUpperCase() + serviceNeeded.slice(1);
        break;
      }
    }
  }

  // Time/scheduling — broader patterns
  let preferredTime: string | null = null;
  const timePatterns = [
    /(?:schedule|book|appointment|come out|available|come by|set up)\s+(?:for\s+)?(?:on\s+)?(.{3,30}?)(?:\.|,|$|\?)/i,
    /(today|tomorrow|tonight|this (?:morning|afternoon|evening|week)|next (?:week|monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+(?:morning|afternoon|evening|at\s+\d+))?/i,
  ];
  for (const pattern of timePatterns) {
    const match = (summary || transcript).match(pattern);
    if (match?.[1]) {
      preferredTime = match[1].trim();
      preferredTime = preferredTime.charAt(0).toUpperCase() + preferredTime.slice(1);
      break;
    }
  }

  return { callerName, callerPhone, callerAddress, serviceNeeded, preferredTime };
}

// ─── Email Notification ─────────────────────────────────────────────────────

async function sendBookingEmail(
  user: { email: string; name: string; business: string },
  booking: {
    callerName: string;
    callerPhone: string;
    callerAddress?: string;
    serviceNeeded: string;
    preferredTime?: string;
    notes?: string;
  }
) {
  const rows = [
    { label: "Caller", value: booking.callerName },
    { label: "Phone", value: booking.callerPhone },
    ...(booking.callerAddress ? [{ label: "Address", value: booking.callerAddress }] : []),
    { label: "Service Needed", value: booking.serviceNeeded },
    ...(booking.preferredTime ? [{ label: "Preferred Time", value: booking.preferredTime }] : []),
  ];

  const detailsTable = `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;border-radius:12px;border:1px solid #f4f4f5;margin:16px 0 24px;">
  ${rows
    .map(
      (r) => `
  <tr>
    <td style="padding:12px 20px;font-size:13px;color:#71717a;width:130px;border-bottom:1px solid #f4f4f5;font-weight:600;">${r.label}</td>
    <td style="padding:12px 20px;font-size:14px;color:#09090b;border-bottom:1px solid #f4f4f5;font-weight:500;">${r.value}</td>
  </tr>`
    )
    .join("")}
</table>`;

  const html = emailLayout({
    preheader: `New lead: ${booking.callerName} — ${booking.serviceNeeded}`,
    body: `
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#09090b;letter-spacing:-0.5px;">
        New Lead Captured
      </h1>
      <p style="margin:0 0 20px;font-size:15px;color:#71717a;line-height:1.6;">
        Riley just handled a call and captured the following details for <strong style="color:#09090b;">${user.business || "your business"}</strong>:
      </p>
      ${detailsTable}
      ${booking.notes ? `
      <p style="margin:0 0 8px;font-size:13px;color:#71717a;font-weight:600;">Call Summary</p>
      <div style="background-color:#fafafa;border-radius:12px;border:1px solid #f4f4f5;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;color:#3f3f46;line-height:1.6;">${booking.notes}</p>
      </div>` : ""}
      <p style="margin:0;font-size:14px;color:#71717a;line-height:1.6;">
        Follow up with this lead as soon as possible. You can view all your leads in your
        <a href="https://proanswer.dev/dashboard" style="color:#09090b;font-weight:700;text-decoration:underline;">ProAnswer dashboard</a>.
      </p>
    `,
  });

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "ProAnswer <notifications@proanswer.dev>",
      to: user.email,
      subject: `New Lead: ${booking.callerName} — ${booking.serviceNeeded}`,
      html,
    });
  } catch (err) {
    console.error("Failed to send booking email:", err);
  }
}
