import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { findByEmail } from "@/lib/users";

const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY!;

export interface VapiCall {
  id: string;
  status: string;
  endedReason?: string;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  transcript?: string;
  recordingUrl?: string;
  type?: string;
}

export interface CallStats {
  answered: number;
  missed: number;
  totalSeconds: number;
  calls: VapiCall[];
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await findByEmail(session.user.email);
  const assistantId = user?.vapiAssistantId ?? null;

  if (!assistantId) {
    return NextResponse.json({ answered: 0, missed: 0, totalSeconds: 0, calls: [] });
  }

  try {
    const res = await fetch(
      `https://api.vapi.ai/call?assistantId=${assistantId}&limit=100`,
      {
        headers: { Authorization: `Bearer ${VAPI_PRIVATE_KEY}`, "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    if (!res.ok) return NextResponse.json({ error: "Failed to fetch from Vapi" }, { status: res.status });

    const data = await res.json();
    const raw: VapiCall[] = Array.isArray(data) ? data : (data.results ?? []);

    const calls: VapiCall[] = raw.map((c) => ({
      id: c.id, status: c.status, endedReason: c.endedReason,
      startedAt: c.startedAt, endedAt: c.endedAt,
      durationSeconds: c.durationSeconds, transcript: c.transcript,
      recordingUrl: c.recordingUrl, type: c.type,
    }));

    const answered    = calls.filter((c) => c.durationSeconds && c.durationSeconds > 0).length;
    const missed      = calls.filter((c) => !c.durationSeconds || c.durationSeconds === 0).length;
    const totalSeconds = calls.reduce((sum, c) => sum + (c.durationSeconds ?? 0), 0);

    return NextResponse.json({ answered, missed, totalSeconds, calls });
  } catch (err) {
    console.error("Vapi API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
