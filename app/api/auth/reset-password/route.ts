import { NextResponse } from "next/server";
import { findByEmail, updateUser } from "@/lib/users";
import { resetTokens } from "@/app/api/auth/forgot-password/route";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const entry = resetTokens.get(token);
  if (!entry || Date.now() > entry.expiresAt) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  const user = await findByEmail(entry.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await updateUser(user.id, { password: hashedPassword });

  // Invalidate the token
  resetTokens.delete(token);

  return NextResponse.json({ ok: true });
}
