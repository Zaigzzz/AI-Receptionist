import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { findByEmail, updateUser } from "@/lib/users";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    profile:           user.profile ?? null,
    name:              user.name,
    vapiAssistantId:   user.vapiAssistantId ?? null,
    vapiPhoneNumberId: user.vapiPhoneNumberId ?? null,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const profile = await req.json();
  await updateUser(user.id, { profile });

  return NextResponse.json({ ok: true });
}
