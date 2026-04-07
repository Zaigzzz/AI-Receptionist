import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { findByEmail } from "@/lib/users";

const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY!;

export interface ProfileData {
  businessName:      string;
  ownerName:         string;
  businessType:      string;
  phone:             string;
  city:              string;
  state:             string;
  hours:             string;
  services:          string;
  firstMessage:      string;
  personality:       string;
  instructions:      string;
  afterHoursMessage: string;
  holidayMessage:    string;
}

function buildSystemPrompt(p: ProfileData): string {
  const location = [p.city, p.state].filter(Boolean).join(", ");
  const toneMap: Record<string, string> = {
    friendly:     "warm, approachable, and conversational",
    professional: "formal, precise, and business-like",
    upbeat:       "energetic, enthusiastic, and positive",
  };
  const tone = toneMap[p.personality] ?? "warm and professional";

  return `You are Riley, a ${tone} AI receptionist for ${p.businessName || "this business"}${location ? ` located in ${location}` : ""}.

BUSINESS INFORMATION:
- Business Name: ${p.businessName || "Not set"}
- Owner: ${p.ownerName || "Not set"}
- Business Type: ${p.businessType || "Not set"}
- Phone: ${p.phone || "Not set"}
- Location: ${location || "Not set"}
- Business Hours: ${p.hours || "Not set"}

SERVICES OFFERED:
${p.services ? p.services : "Please ask the owner for a list of services."}

YOUR ROLE:
- Answer every call warmly and professionally
- Help callers book appointments, get service info, and leave messages
- Always represent ${p.businessName || "the business"} with care and ${tone} tone
- Collect the caller's name and phone number for any service requests
- If you cannot answer a question, offer to have ${p.ownerName || "the owner"} call them back

${p.hours ? `BUSINESS HOURS:
We are open ${p.hours}. Always let callers know our hours when relevant.` : ""}

${p.afterHoursMessage ? `AFTER HOURS:
If someone calls outside of business hours, say:
"${p.afterHoursMessage}"` : ""}

${p.holidayMessage ? `HOLIDAYS / CLOSED DAYS:
If we are closed for a holiday or special closure, say:
"${p.holidayMessage}"` : ""}

${p.instructions ? `SPECIAL INSTRUCTIONS:
${p.instructions}` : ""}

Always be concise and helpful. Never make up information you don't have — offer to take a message instead.`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await findByEmail(session.user.email);
  const assistantId = user?.vapiAssistantId;

  if (!assistantId) {
    return NextResponse.json({ error: "No Vapi assistant configured for this account" }, { status: 400 });
  }

  const profile: ProfileData = await req.json();

  const systemPrompt = buildSystemPrompt(profile);

  const defaultGreeting = `Thanks for calling ${profile.businessName || "us"}! This is Riley. How can I help you today?`;
  const firstMessage = profile.firstMessage?.trim() || defaultGreeting;

  const res = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstMessage,
      model: {
        provider: "openai",
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
        ],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
