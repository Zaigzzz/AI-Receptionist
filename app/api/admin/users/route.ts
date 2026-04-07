import { NextResponse } from "next/server";
import { readUsers } from "@/lib/users";

export async function GET(req: Request) {
  const secret   = process.env.ADMIN_SECRET;
  const provided = req.headers.get("x-admin-secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allUsers = await readUsers();
  const users = allUsers.map(({ password: _pw, ...rest }) => rest);
  return NextResponse.json(users);
}
