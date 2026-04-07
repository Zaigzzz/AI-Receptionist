import { NextResponse } from "next/server";
import { readUsers } from "@/lib/users";
import { auth } from "@/auth";

async function isAdmin(req: Request): Promise<boolean> {
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
  const users = allUsers.map(({ password: _pw, ...rest }) => rest);
  return NextResponse.json(users);
}
