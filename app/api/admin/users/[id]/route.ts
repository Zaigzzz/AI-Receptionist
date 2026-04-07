import { NextResponse } from "next/server";
import { updateUser, findById } from "@/lib/users";
import { auth } from "@/auth";

async function isAdmin(req: Request): Promise<boolean> {
  const session = await auth();
  if (session?.user?.email === process.env.FOUNDER_EMAIL) return true;
  const secret = process.env.ADMIN_SECRET;
  const provided = req.headers.get("x-admin-secret");
  return !!(secret && provided === secret);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const user = await findById(id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const stringFields = ["vapiAssistantId", "vapiPhoneNumberId", "vapiPhoneNumber", "plan", "status", "notes"] as const;
  const boolFields = ["forwardingSetup"] as const;
  const data: Record<string, string | boolean> = {};
  for (const field of stringFields) {
    if (field in body) data[field] = body[field];
  }
  for (const field of boolFields) {
    if (field in body) data[field] = Boolean(body[field]);
  }

  const updated = await updateUser(id, data);
  const { password: _pw, ...safe } = updated;
  return NextResponse.json({ ok: true, user: safe });
}
