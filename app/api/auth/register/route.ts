import { NextResponse } from "next/server";
import { findByEmail, createUser } from "@/lib/users";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { name, business, email, password } = await req.json();

  if (!name || !business || !email || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (await findByEmail(email)) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await createUser({ name, business, email, password: hashedPassword });
  return NextResponse.json({ ok: true, username: user.username });
}
