import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { findByEmail } from "@/lib/users";

const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY!;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await findByEmail(session.user.email);
  const assistantId   = user?.vapiAssistantId;
  const phoneNumberId = user?.vapiPhoneNumberId;

  if (!assistantId || !phoneNumberId) {
    return NextResponse.json({ error: "No Vapi assistant configured for this account" }, { status: 400 });
  }

  const { enabled } = await req.json();
  const body = enabled ? { assistantId } : { assistantId: null };

  const res = await fetch(`https://api.vapi.ai/phone-number/${phoneNumberId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${VAPI_PRIVATE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  return NextResponse.json({ ok: true, enabled });
}
