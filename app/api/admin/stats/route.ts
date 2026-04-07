import { NextResponse } from "next/server";
import { readUsers } from "@/lib/users";
import { auth } from "@/auth";

const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY!;

export interface AdminCall {
  id: string; status: string; endedReason?: string;
  startedAt?: string; endedAt?: string; durationSeconds?: number;
  transcript?: string; recordingUrl?: string; type?: string;
}

export interface AdminStats {
  users: Array<{
    id: string; name: string; username: string; business: string;
    email: string; createdAt: string; plan?: string | null;
    subscriptionStatus?: string | null; vapiAssistantId?: string | null;
    vapiPhoneNumberId?: string | null;
    profile?: {
      businessName: string; ownerName: string; businessType: string;
      phone: string; city: string; state: string; hours: string;
      services: string; firstMessage: string; personality: string;
      instructions: string; afterHoursMessage: string; holidayMessage: string;
    } | null;
  }>;
  calls: AdminCall[];
  answered: number;
  missed: number;
  totalSeconds: number;
}

async function isAdmin(req: Request): Promise<boolean> {
  // Support both session auth and legacy header auth
  const session = await auth();
  if (session?.user?.email === process.env.FOUNDER_EMAIL) return true;
  const secret = process.env.ADMIN_SECRET;
  const provided = req.headers.get("x-admin-secret");
  return !!(secret && provided === secret);
}

export async function GET(req: Request) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allUsers = await readUsers();
  const users = allUsers.map(({ password: _pw, ...rest }) => ({
    ...rest,
    createdAt: rest.createdAt instanceof Date ? rest.createdAt.toISOString() : String(rest.createdAt),
    profile: rest.profile as AdminStats["users"][0]["profile"] ?? null,
  }));

  let calls: AdminCall[] = [];
  let answered = 0, missed = 0, totalSeconds = 0;

  try {
    const res = await fetch(
      `https://api.vapi.ai/call?assistantId=${ASSISTANT_ID}&limit=100`,
      { headers: { Authorization: `Bearer ${VAPI_PRIVATE_KEY}`, "Content-Type": "application/json" }, cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      const raw: AdminCall[] = Array.isArray(data) ? data : (data.results ?? []);
      calls = raw.map((c) => ({
        id: c.id, status: c.status, endedReason: c.endedReason,
        startedAt: c.startedAt, endedAt: c.endedAt,
        durationSeconds: c.durationSeconds, transcript: c.transcript,
        recordingUrl: c.recordingUrl, type: c.type,
      }));
      answered     = calls.filter((c) => c.durationSeconds && c.durationSeconds > 0).length;
      missed       = calls.filter((c) => !c.durationSeconds || c.durationSeconds === 0).length;
      totalSeconds = calls.reduce((sum, c) => sum + (c.durationSeconds ?? 0), 0);
    }
  } catch { /* Vapi unavailable */ }

  return NextResponse.json({ users, calls, answered, missed, totalSeconds });
}
